Welcome! This is **Messageme**, a messaging platform for mobile devices. We developed it for testing and academic purposes. It features the ability to exchange text and pictures over private chats among users. You can deploy this project on a single computer. For the client, you can use either emulators or physical devices. NOTE: If you want to run emulators, it is highly recommended to deploy this project on a bare metal machine, not a virtual machine.

This project includes both the client and the server. The client app has been developed with [Expo Go](https://docs.expo.dev/get-started/expo-go/), based on [React Native](https://reactnative.dev/), so that you can run it on Android and iOS devices. The server has been developed with [NestJS](https://nestjs.com/) and uses a [MongoDB](https://www.mongodb.com) self-hosted database in the backend.

We have tested most things on a fresh install of Ubuntu Desktop 22.04.3, but you should be able to deploy it on any platform, by following the provided reference links. The steps we suggest are meant for an isolated lab environment, meaning that it's on your responsibility to check their impact on your particular computing and networking environment.

# Preparing the network environment

If you do not intend to use physical devices, then skip to next section.

You first set up your computer to act as a WiFi access point for the phones to connect to. In our lab, the computer is connected to the Internet via an Ethernet cable. We used [create_ap](https://github.com/oblique/create_ap/) in NAT mode, so that the phones can reach the Internet without configuring any routing on the computer. Below is our template for `/etc/create_ap.conf`, which creates a hidden WiFi.

```
CHANNEL=default

WPA_VERSION=2
ETC_HOSTS=1

HIDDEN=1
MAC_FILTER=0

ISOLATE_CLIENTS=0
SHARE_METHOD=nat

DRIVER=nl80211

COUNTRY=PT
FREQ_BAND=2.4

WIFI_IFACE=wlan0
INTERNET_IFACE=eth0
SSID=LabWifi
PASSPHRASE=putsomepasswordhere
```

To start the access point, run:

```
systemctl start create_ap
```

To make the service start automatically when you boot up your computer, run:

```
systemctl enable create_ap
```

Next, configure your computer to act as a DHCP server.  You will find plenty tutorials on the Internet on how to do so.

You should now be able to connect via WiFi from your phone. Once connected, check that you have Internet access and that you can ping the computer (you can use some app to do so).

Also, throughout this guide, remember to open any necessary ports of the firewall of your computer's OS, if applicable.

# Installing the Expo Go development environment

Follow the steps to [install Expo](https://docs.expo.dev/get-started/installation/). See the notes below if you need more help.

For the **Node.js** installation, we used the [installation script](https://github.com/nodesource/distributions#ubuntu-versions):

```
curl -fsSL https://deb.nodesource.com/setup_21.x | sudo -E bash - &&\
sudo apt-get install -y nodejs
```

Check:

```
node -v
```

In our environment, we have `v21.6.0`

To install **git**, do

```
sudo apt-get install git
```

Check:

```
git --version
```

In our environment, we have `git version 2.34.1`

For **watchman**, install curl with

```
sudo apt-get install curl 
```

Then install [brew](https://brew.sh/) with

```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

<u>REMINDER</u>: Don't forget to follow the Next Steps that are indicated at the end of the output of the brew installation.

Check:

```
brew -v
```

In our environment, we have `Homebrew 4.2.4`

Finally, install watchman with

```
brew install watchman
```

Check:

```
watchman version
```

In our environment, we have `version: 2023.12.04.00`

You should now be fine to use Expo.

# Installing Node.js modules

From the `client/` folder,

```
npm install
```

From the `server/` folder,

```
npm install
```

You can ignore any warnings and notices for now.

# Editing configuration files

Edit `client/src/parameters.js` and `server/src/parameters.ts` according to your needs and your environment.

# Installing MongoDB

Download the [Community Server](https://www.mongodb.com/try/download/community) and install it:

```
sudo dpkg -i mongodb-org-server_7.0.5_amd64.deb
```

Check:

```
mongod --version
```

Enable the service (so that it starts when your computer boots up):

```
sudo systemctl enable mongod
```

Start the service:

```
sudo systemctl start mongod
```

Check the service:

```
sudo systemctl status mongod
```

Optionally, install the [MongoDB Compass](https://www.mongodb.com/products/tools/compass). It is a GUI for this database.

# Starting the server

Install NestJS CLI tools, as explained in the [docs](https://docs.nestjs.com/):

```
npm i -g @nestjs/cli
```

From the `server/` folder, start the server:

```
npm start
```

You should get a `Nest application successfully started`.

# Running the app

There are different ways to deploy and launch the Messageme app. Expo Go provides a shell environment to easily and quickly test features. If you want a standalone app, then you want to deploy a bare React Native build. Besides, you may want to either use virtual or physical devices. Choose the option(s) below that you want.

### Launching the app on a physical device with Expo Go

With Expo Go, you use the Expo Go app as a bridge to execute the app. This is likely the fastest way to get it up and running.

Follow [this guide](https://docs.expo.dev/get-started/expo-go/). You will need to create an Expo Go account and install the Expo Go app on your Android or iOS device. As explained in the guide, you will need to do this, from the `client/` folder:

```
npx expo start
```

The app UI is pretty straightforward. If you have two mobile devices, you should now be able to play sending and receiving messages over a private chat!!

### Launching the app on an Android emulator with Expo Go

Follow [this Expo Go guide for Android Studio emulator integration](https://docs.expo.dev/workflow/android-studio-emulator/).

For the Android Studio installation, edit `/etc/environment` and:

- Check the Android Studio installation steps found in `Install-Linux-tar.txt`, and add your `{installation home}/bin` directory to the PATH environment variable.
- As per the Expo Go guide, create the ANDROID_HOME environment variable.
- Add the value of `$ANDROID_HOME/platform-tools` to your PATH environment variable. We used a literal path, e.g. `/home/devuser/Android/Sdk/platform-tools/`

Then reboot your computer to apply the changes.

Check:

```
adb version
```

In our environment, we have `Android Debug Bridge version 1.0.41`

Check:

```
studio.sh
```

In our environment, we have `Android Studio Hedgehog | 2023.1.1 Patch 1`. 

Also follow the steps to create an AVD (and duplicate your AVD if you want to play with more than one device).

*NOTE: Running the Android emulator from a VirtualBox VM is not supported, and we did not manage to make it work. If you want to try anyway, shut down your VM and run this from the host before booting your VM again: `VBoxManage modifyvm <your_vm_name> --nested-hw-virt on`*

Install the emulator:

```
sudo apt install google-android-emulator-installer
```

Run this to confirm your list of created AVDs:

```
emulator -list-avds
```

Launch one AVD with the command below. Replace <avd_name> with the name of your AVD.

```
emulator @<avd_name>
```

From the client/ folder, start Expo Go:

```
npx expo start
```

Make sure you have only one emulator running, and that no phones connected to your computer via cable. Then, press `a` for `open Android`. It will automatically install the Expo Go app, and launch your app.

For any AVDs you want to use, repeat the same steps: Make sure no other AVD is running and no phone is physically connected to your computer, then press `a`.

Once you have installed the Expo Go on all your AVDs, you can then start all your AVDs at once, run the Expo Go app, launch Messageme, and play with sending and receiving messages.

### Deploying the APK and running the app on a physical Android device (bare React Native)

Here we will deploy the app as a bare React Native app. You will need to compile your project to generate the APK file. The [Expo Go 'Create your first build' guide](https://docs.expo.dev/build/setup/) provides the steps to use the EAS cloud service for the compilation. However, we prefer to compile locally, using the [Expo Go 'Local app development' guide](https://docs.expo.dev/guides/local-app-development/). Below is a summary of the steps you need to perform.

We already have the Node.js, watchman, and Android Studio set up in previous steps. So now we have to install the JDK that we have downloaded from [here](https://wiki.openjdk.org/display/JDKUpdates/JDK+17u). NOTE: It does not work with Java 21.

To install the JDK, just unpack it somewhere in your computer and add the path to the bin folder to the PATH environment variable, as we did in previous steps. In our case, the path is `/home/devuser/software/OpenJDK17/OpenJDK17U-jdk_x64_linux_hotspot_17.0.10_7/jdk-17.0.10+7/bin`

After having restarted your computer, check:

```
java --version
```

In our environment, we have `openjdk 17.0.10 2024-01-16`

Optional:

```
npx expo-doctor
```

It should give `Didn't find any issues with the project!`

Prepare your first build:

```
npx expo prebuild --clean
```

The `--clean` option is usefull if you make major changes (such as the target API version) and you want to make sure that old files are cleared before running the build.

Now, we have to follow steps 1 & 2 from the [Expo Go 'Create your first build' guide](https://docs.expo.dev/build/setup/), so:

Install EAS. Despite not being stated in the official guide, we needed a sudo:

```
sudo npm install -g eas-cli
```

Then log in to your EAS account. If you do not have any, just create one.

```
eas login
```

Now... **Build!** You can replace `preview` with a custom build name. It will ask you to create a local git account. You will likely see a ton of deprecation and other warnings; you can skip them for now.

```
eas build -p android --profile preview --local
```

It should give you a `Build successful` and a message indicating where the APK artifact has been generated.

Finally, follow the steps explained in the '<u>Install with adb</u>' section of the [Expo Go 'Build APKs for Android Emulators and devices' guide](https://docs.expo.dev/build-reference/apk/#install-with-adb).

Once you have the app installed in your phone, have fun!



Alternatively, you can build & run with a single command, as explained in the 'Local app development' guide:

```
npx expo run:android
```

You can also deploy the APK on an AVD as well. According to the [Expo Go 'Build APKs for Android Emulators and devices' guide](https://docs.expo.dev/build-reference/apk/#emulator-virtual-device), the command is:

```
eas build:run -p android
```

