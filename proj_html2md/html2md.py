import os
import shutil
import logging
import sys
import threading
import re
import urllib.parse
from pathlib import Path
from typing import List, Optional, Dict
from tkinter import filedialog, messagebox, ttk
import tkinter as tk
from bs4 import BeautifulSoup
from markdownify import markdownify as md
from tqdm import tqdm

# 配置日志
logging.basicConfig(
    level=logging.INFO, 
    format='%(levelname)s: %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)

class HTMLToObsidianConverter:
    """解决占位符被转义问题的最终修正版。"""

    def __init__(self, source_dir: str, output_dir: str, on_complete_callback=None) -> None:
        self.source_path: Path = Path(source_dir).resolve()
        self.output_path: Path = Path(output_dir).resolve()
        self.attachments_path: Path = self.output_path / "attachments"
        self.on_complete: Optional[callable] = on_complete_callback
        
        self.attachments_path.mkdir(parents=True, exist_ok=True)

    def _get_title(self, soup: BeautifulSoup) -> str:
        title_tag = soup.find("title")
        return title_tag.get_text(strip=True) if title_tag else "Untitled"

    def _clean_html(self, soup: BeautifulSoup) -> None:
        """彻底清洗干扰标签。"""
        noise_tags = ["style", "script", "head", "meta", "link", "nav", "header", "footer", "aside", "form", "button", "search"]
        for tag in soup.find_all(noise_tags):
            tag.decompose()

        for _ in range(3):
            for tag in soup.find_all(["div", "span", "li", "ul", "ol", "p"]):
                if not tag.find_all("img") and not tag.get_text(strip=True):
                    tag.decompose()

        for text_node in soup.find_all(string=True):
            if "\xa0" in text_node:
                text_node.replace_with(text_node.replace("\xa0", " "))

        for tag in soup.find_all(["div", "span"]):
            tag.unwrap()

    def _process_attachments(self, soup: BeautifulSoup, html_file_path: Path) -> Dict[str, str]:
        """定位图片并返回一个 {占位符: 新文件名} 映射。使用无下划线的占位符。"""
        img_tags = soup.find_all("img")
        html_stem: str = html_file_path.stem
        replacements = {}

        for i, img in enumerate(img_tags):
            src: Optional[str] = img.get("src")
            if not src or src.startswith(("http://", "https://", "data:")):
                continue

            decoded_src = urllib.parse.unquote(src).replace("\\", "/")
            file_name = decoded_src.split("/")[-1]
            
            path_candidates = [
                (html_file_path.parent / decoded_src).resolve(),
                (html_file_path.parent / decoded_src.lstrip("/")).resolve(),
                (html_file_path.parent / f"{html_stem}_files" / file_name).resolve(),
                (html_file_path.parent / f"{html_stem}.assets" / file_name).resolve(),
                (html_file_path.parent / "attachments" / file_name).resolve()
            ]

            found_path = next((p for p in path_candidates if p.exists() and p.is_file()), None)

            # 使用纯字母数字的占位符，防止 markdownify 转义下划线
            placeholder = f"IMGRPLC{i}X{id(img)}"
            
            if found_path:
                new_img_name = f"{html_stem}_{found_path.name}"
                try:
                    shutil.copy2(found_path, self.attachments_path / new_img_name)
                    replacements[placeholder] = new_img_name
                    img.replace_with(soup.new_string(placeholder))
                except Exception as e:
                    logging.error(f"复制失败: {e}")
            else:
                # 记录找不到的图片，依然保持引用
                replacements[placeholder] = file_name
                img.replace_with(soup.new_string(placeholder))
        
        return replacements

    def convert_file(self, html_file_path: Path) -> None:
        try:
            with open(html_file_path, "rb") as f:
                content_bytes = f.read()

            soup = BeautifulSoup(content_bytes, "lxml")
            if not soup.find() or not soup.get_text().strip():
                for enc in ["utf-8-sig", "gb18030", "utf-16"]:
                    try:
                        soup = BeautifulSoup(content_bytes.decode(enc), "lxml")
                        if soup.find(): break
                    except UnicodeDecodeError: continue

            title = self._get_title(soup)
            img_map = self._process_attachments(soup, html_file_path)
            self._clean_html(soup)

            # 转换
            markdown_text = md(str(soup), heading_style="ATX", bullets="-")

            # 强力替换占位符
            for placeholder, filename in img_map.items():
                # 注意：Obsidian 路径中如果包含 () 是合法的，不应转义
                # 显式使用 ![[attachments/filename]]
                wikilink = f"![[attachments/{filename}]]"
                markdown_text = markdown_text.replace(placeholder, wikilink)

            # 强力后处理清理开头
            markdown_text = markdown_text.strip()
            # 1. 移除特定的“HTML/日期/星期”页眉模式 (使用 \s+ 适配不确定的换行)
            # 匹配模式：HTML 开始，中间经过数字和星期，直到遇到实质性内容
            header_pattern = r'^HTML\s+\d{1,2}\s+\d{1,2}\s+星期.\s+'
            markdown_text = re.sub(header_pattern, '', markdown_text, flags=re.IGNORECASE | re.DOTALL)
            
            # 2. 移除开头所有仅包含列表占位符（. 、 - 、 *）或空白的行
            markdown_text = re.sub(r'^([\s\-\.\*]+\n)+', '', markdown_text)
            markdown_text = markdown_text.strip()

            front_matter = f"---\ntitle: \"{title}\"\nsource_file: \"{html_file_path.name}\"\n---\n\n"
            final_content = front_matter + markdown_text

            relative_path = html_file_path.relative_to(self.source_path)
            output_file_path = (self.output_path / relative_path).with_suffix(".md")
            output_file_path.parent.mkdir(parents=True, exist_ok=True)

            with open(output_file_path, "w", encoding="utf-8") as f:
                f.write(final_content)
        except Exception as e:
            logging.error(f"\n处理 {html_file_path} 出错: {e}")

    def run(self) -> None:
        html_files = list(self.source_path.rglob("*.html")) + list(self.source_path.rglob("*.htm"))
        if not html_files:
            messagebox.showwarning("警告", "未找到 HTML 文件。")
            return

        print(f"\n图片链路深度修复中...")
        for file_path in tqdm(html_files, desc="总进度", unit="file", ncols=80):
            self.convert_file(file_path)
        
        if self.on_complete:
            self.on_complete(len(html_files))

class ConverterGUI:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("HTML to Obsidian 转换器 (占位符增强版)")
        self.root.geometry("600x250")
        self.root.resizable(False, False)
        self.src_dir, self.dst_dir = tk.StringVar(), tk.StringVar()
        self._setup_ui()

    def _setup_ui(self):
        main_frame = ttk.Frame(self.root, padding="20")
        main_frame.pack(fill=tk.BOTH, expand=True)
        ttk.Label(main_frame, text="源文件夹:").grid(row=0, column=0, sticky=tk.W, pady=5)
        ttk.Entry(main_frame, textvariable=self.src_dir, width=50).grid(row=0, column=1, padx=5)
        ttk.Button(main_frame, text="浏览", command=lambda: self.src_dir.set(filedialog.askdirectory())).grid(row=0, column=2)
        ttk.Label(main_frame, text="输出文件夹:").grid(row=1, column=0, sticky=tk.W, pady=5)
        ttk.Entry(main_frame, textvariable=self.dst_dir, width=50).grid(row=1, column=1, padx=5)
        ttk.Button(main_frame, text="浏览", command=lambda: self.dst_dir.set(filedialog.askdirectory())).grid(row=1, column=2)
        self.status_label = ttk.Label(main_frame, text="就绪", foreground="gray")
        self.status_label.grid(row=2, column=0, columnspan=3, pady=20)
        self.start_btn = ttk.Button(main_frame, text="开始转换", command=self._start)
        self.start_btn.grid(row=3, column=0, columnspan=3, pady=10)

    def _start(self):
        src, dst = self.src_dir.get(), self.dst_dir.get()
        if not src or not dst: return
        self.start_btn.config(state=tk.DISABLED)
        self.status_label.config(text="正在处理...", foreground="blue")
        def task():
            HTMLToObsidianConverter(src, dst, self._finish).run()
        threading.Thread(target=task, daemon=True).start()

    def _finish(self, count):
        self.root.after(0, lambda: self._ui_finish(count))

    def _ui_finish(self, count):
        self.start_btn.config(state=tk.NORMAL)
        self.status_label.config(text=f"完成，共处理 {count} 个文件", foreground="green")
        messagebox.showinfo("成功", f"任务已完成！\n图片占位符已强制替换回纯净链接。")

if __name__ == "__main__":
    ConverterGUI().root.mainloop()
