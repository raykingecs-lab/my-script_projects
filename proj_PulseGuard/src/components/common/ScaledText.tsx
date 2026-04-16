import React from 'react';
import { Text, TextProps } from 'react-native';
import { Theme } from '../../constants/Theme';

interface ScaledTextProps extends TextProps {
  type?: keyof typeof Theme.fontSize;
  color?: string;
  bold?: boolean;
  center?: boolean;
}

/**
 * 脉安标准文本组件
 * 默认使用 Theme.fontSize.body (22pt)，禁用系统自动缩放
 */
export const ScaledText: React.FC<ScaledTextProps> = ({ 
  type = 'body', 
  color, 
  bold = false, 
  center = false,
  style, 
  children, 
  ...props 
}) => {
  return (
    <Text 
      style={[
        {
          fontSize: Theme.fontSize[type],
          color: color || Theme.colors.text,
          fontWeight: bold ? '700' : '400',
          textAlign: center ? 'center' : 'left',
        },
        style
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};
