import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';

interface BigTextProps extends TextProps {
  size?: keyof typeof SIZES;
  color?: string;
  bold?: boolean;
}

export const BigText: React.FC<BigTextProps> = ({ 
  size = 'body', 
  color = COLORS.text, 
  bold = false, 
  style, 
  children, 
  ...props 
}) => {
  return (
    <Text 
      allowFontScaling={false} // 禁用系统缩放，由应用逻辑控制
      style={[
        {
          fontSize: SIZES[size] || SIZES.body,
          color,
          fontWeight: bold ? 'bold' : 'normal',
        },
        style
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};
