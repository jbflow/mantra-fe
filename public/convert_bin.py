arr = []
with open('talkback.ppn', 'rb') as f:
    while True:
        b = f.read(1)
        if b:
            arr.append('0x' + b.hex())
        else:
            break
    print(arr)