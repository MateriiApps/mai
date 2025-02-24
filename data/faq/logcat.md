**How do I provide a logcat?**

A logcat provides invaluable information about any errors that occurred in the app(s) and system.
It is extremely useful for debugging.

You will need:
- A computer
- ADB installed ([Windows tutorial](<https://streamable.com/h0618w>))

1. Enable USB debugging in your phone's developer options
2. Run the following command in a terminal (cmd for Windows):
```sh
adb logcat -c
```
3. If you have not previously authorized adb on your phone, approve the popup
4. Open the app and reproduce the bug/issue
5. Run the following command:
```sh
# Do *NOT* apply ANY filters at ALL!!
adb logcat -d > logcat.txt
```
6. The generated logcat will be in your user home directory