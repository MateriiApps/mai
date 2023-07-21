**How do I provide a logcat?**

A logcat provides invaluable information about any errors that occurred in our app(s) or related errors
on your device for further debugging. (Do **NOT** apply **ANY** filters!)

You will need:
- A computer
- ADB installed ([Windows tutorial](<https://streamable.com/h0618w>))

1. Enable USB debugging in your phone's developer options
2. Run the following command in a terminal (cmd for Windows):
```sh
adb logcat -c
```
3. If you have not previously authorized adb on your phone, open it now and authorize your pc
4. Now open OpenCord and reproduce the issue
5. Run the following command now
```sh
adb logcat -d > logcat.txt
```
6. The generated logcat will be in your user home directory