arr = []
with open('talkback.ppn', 'rb') as f:
    while True:
        b = f.read(1)
        if b:
            arr.append(b)
        else:
            break
    print(arr)