def luminance(hex_color):
    hex_color = hex_color.lstrip('#')
    r, g, b = tuple(int(hex_color[i:i+2], 16)/255.0 for i in (0, 2, 4))
    def adjust(c): return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * adjust(r) + 0.7152 * adjust(g) + 0.0722 * adjust(b)

def contrast(hex1, hex2):
    l1 = luminance(hex1)
    l2 = luminance(hex2)
    return (max(l1, l2) + 0.05) / (min(l1, l2) + 0.05)

print(f"Caregiver: {contrast('#FFFDF9', '#473633'):.2f}:1")
print(f"Patient: {contrast('#FFF4F4', '#4A2B2B'):.2f}:1")
