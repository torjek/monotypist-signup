import os
from PIL import Image

folder = 'favicon_io'
for filename in os.listdir(folder):
    if filename.endswith('.png') or filename.endswith('.ico'):
        filepath = os.path.join(folder, filename)
        try:
            img = Image.open(filepath)
            img = img.convert("RGBA")
            datas = img.getdata()

            new_data = []
            for item in datas:
                # Replace white or near-white with transparent
                if item[0] > 240 and item[1] > 240 and item[2] > 240:
                    new_data.append((255, 255, 255, 0))
                else:
                    new_data.append(item)
                    
            img.putdata(new_data)
            
            if filename.endswith('.ico'):
                img.save(filepath, format='ICO', sizes=[(img.width, img.height)])
            else:
                img.save(filepath, "PNG")
            print(f"Processed {filename}")
        except Exception as e:
            print(f"Failed {filename}: {e}")
