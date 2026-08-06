from PIL import Image
from collections import Counter

img = Image.open('MonoTypist_logo_dark.png')
print("Size:", img.size)
img = img.resize((100, 100)) # resize to small for faster processing
colors = img.getcolors(10000)
colors.sort(key=lambda x: x[0], reverse=True)
print("Top colors (count, RGBA/RGB):")
for c in colors[:20]:
    print(c)
