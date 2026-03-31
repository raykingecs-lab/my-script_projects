import cv2
import numpy as np
import os
import time
import datetime
import tkinter as tk
from tkinter import filedialog, messagebox
from PIL import Image, ImageGrab
import keyboard
import threading

"""
网课截图与 Markdown 笔记自动生成器 (Windows 版)
依赖包安装：pip install opencv-python Pillow keyboard numpy
"""

class ScreenshotAssistant:
    def __init__(self):
        self.root = tk.Tk()
        self.root.withdraw() # 隐藏主窗口
        
        self.lecture_name = ""
        self.save_dir = ""
        self.target_dir = ""
        self.md_path = ""
        self.roi = None # (x, y, w, h)
        
        self.is_running = False
        self.last_hash = None
        self.cooldown = 5 # 触发后的冷却时间（秒）
        self.diff_threshold = 12 # 哈希差异阈值，越大越不敏感

    def get_initial_config(self):
        """弹出初始化配置对话框"""
        config_win = tk.Toplevel(self.root)
        config_win.title("网课截图助手 - 配置")
        config_win.geometry("400x250")
        config_win.attributes("-topmost", True)

        tk.Label(config_win, text="讲座/课程名称:").pack(pady=5)
        name_entry = tk.Entry(config_win, width=40)
        name_entry.pack(pady=5)
        name_entry.insert(0, "新讲座_" + datetime.datetime.now().strftime("%Y%m%d"))

        tk.Label(config_win, text="保存根目录:").pack(pady=5)
        path_frame = tk.Frame(config_win)
        path_frame.pack(pady=5)
        path_entry = tk.Entry(path_frame, width=30)
        path_entry.pack(side=tk.LEFT)
        
        def browse_folder():
            folder = filedialog.askdirectory()
            if folder:
                path_entry.delete(0, tk.END)
                path_entry.insert(0, folder)

        tk.Button(path_frame, text="浏览", command=browse_folder).pack(side=tk.LEFT, padx=5)

        def confirm():
            self.lecture_name = name_entry.get().strip()
            self.save_dir = path_entry.get().strip()
            if not self.lecture_name or not self.save_dir:
                messagebox.showerror("错误", "请填写完整信息！")
                return
            
            # 创建文件夹和MD文件
            self.target_dir = os.path.join(self.save_dir, self.lecture_name)
            if not os.path.exists(self.target_dir):
                os.makedirs(self.target_dir)
            
            self.md_path = os.path.join(self.target_dir, f"{self.lecture_name}_笔记.md")
            if not os.path.exists(self.md_path):
                with open(self.md_path, "w", encoding="utf-8") as f:
                    f.write(f"# {self.lecture_name}\n\n")
                    f.write(f"> 记录开始时间：{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n---\n\n")
            
            config_win.destroy()
            self.select_roi()

        tk.Button(config_win, text="下一步：选择截图区域", command=confirm, bg="#4CAF50", fg="white", height=2).pack(pady=20)
        self.root.wait_window(config_win)

    def select_roi(self):
        """全屏蒙层选择截图区域"""
        selection_win = tk.Toplevel(self.root)
        selection_win.attributes("-fullscreen", True)
        selection_win.attributes("-alpha", 0.3)
        selection_win.config(cursor="cross")
        selection_win.attributes("-topmost", True)

        canvas = tk.Canvas(selection_win, cursor="cross", bg="grey")
        canvas.pack(fill="both", expand=True)

        start_x = start_y = 0
        rect = None

        def on_button_press(event):
            nonlocal start_x, start_y, rect
            start_x, start_y = event.x, event.y
            rect = canvas.create_rectangle(start_x, start_y, start_x, start_y, outline="red", width=2)

        def on_move_press(event):
            nonlocal rect
            canvas.coords(rect, start_x, start_y, event.x, event.y)

        def on_button_release(event):
            end_x, end_y = event.x, event.y
            x1, x2 = min(start_x, end_x), max(start_x, end_x)
            y1, y2 = min(start_y, end_y), max(start_y, end_y)
            # 兼容高分屏缩放可能需要处理，这里使用标准坐标
            self.roi = (x1, y1, x2 - x1, y2 - y1)
            selection_win.destroy()
            self.start_monitoring()

        canvas.bind("<ButtonPress-1>", on_button_press)
        canvas.bind("<B1-Motion>", on_move_press)
        canvas.bind("<ButtonRelease-1>", on_button_release)
        
        messagebox.showinfo("操作提示", "请按住鼠标左键，在屏幕上框选出 PPT 播放区域。完成后松开鼠标即可。")

    def get_image_hash(self, img):
        """计算图像的均值哈希 (aHash)"""
        # 转为灰度并缩小到 8x8
        cv_img = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2GRAY)
        cv_img = cv2.resize(cv_img, (8, 8), interpolation=cv2.INTER_AREA)
        # 计算平均像素值
        avg = cv_img.mean()
        # 生成 64 位哈希指纹
        hash_str = ''.join(['1' if j > avg else '0' for j in cv_img.flatten()])
        return hash_str

    def compare_hash(self, hash1, hash2):
        """计算两个哈希值的汉明距离（差异位数）"""
        return sum(c1 != c2 for c1, c2 in zip(hash1, hash2))

    def save_screenshot_and_update_md(self, img):
        """保存图片并追加到 Markdown"""
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        img_filename = f"PPT_{timestamp}.png"
        img_path = os.path.join(self.target_dir, img_filename)
        
        img.save(img_path)
        
        with open(self.md_path, "a", encoding="utf-8") as f:
            f.write(f"![{img_filename}](./{img_filename})\n\n\n\n")
        
        print(f"[{datetime.datetime.now().strftime('%H:%M:%S')}] 检测到翻页，已保存截图：{img_filename}")

    def stop_script(self, event=None):
        """安全退出程序"""
        print("\n收到退出指令 (F12)，程序安全关闭。")
        self.is_running = False
        self.root.quit()

    def start_monitoring(self):
        """启动监控循环"""
        self.is_running = True
        print(f"--- 监控中 ---")
        print(f"保存路径: {self.target_dir}")
        print(f"停止快捷键: F12")
        
        keyboard.add_hotkey('f12', self.stop_script)

        # 捕获初始基准帧
        initial_img = ImageGrab.grab(bbox=(self.roi[0], self.roi[1], 
                                          self.roi[0] + self.roi[2], 
                                          self.roi[1] + self.roi[3]))
        self.last_hash = self.get_image_hash(initial_img)
        self.save_screenshot_and_update_md(initial_img)

        def loop():
            while self.is_running:
                try:
                    # 抓取当前选定区域
                    current_img = ImageGrab.grab(bbox=(self.roi[0], self.roi[1], 
                                                      self.roi[0] + self.roi[2], 
                                                      self.roi[1] + self.roi[3]))
                    current_hash = self.get_image_hash(current_img)
                    
                    # 比较差异
                    diff = self.compare_hash(self.last_hash, current_hash)
                    
                    if diff > self.diff_threshold:
                        self.save_screenshot_and_update_md(current_img)
                        self.last_hash = current_hash
                        # 冷却期防止转场动画误触发
                        time.sleep(self.cooldown)
                    else:
                        # 轮询间隔
                        time.sleep(1)
                except Exception as e:
                    print(f"运行异常: {e}")
                    time.sleep(2)

        # 后台运行监控，避免阻塞 GUI 线程
        monitor_thread = threading.Thread(target=loop, daemon=True)
        monitor_thread.start()
        
        self.root.mainloop()

if __name__ == "__main__":
    app = ScreenshotAssistant()
    app.get_initial_config()
    print("笔记生成任务已结束。")
