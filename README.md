

| ![user1 screenshot](user1_screenshot.jpg) | ![user2 screenshot](user2_screenshot.jpg) |
| :---------------------------------------: | :---------------------------------------: |

 

Welcome! This is **Messageme**, a no-frills messaging platform for mobile devices. We developed it for testing and academic purposes. It features the ability to exchange text and pictures over private chats among users. You can deploy this project on a single computer. For the client, you can use either emulators or physical devices. NOTE: If you want to run phone emulators, it is highly recommended to deploy this project on a bare metal machine, not a virtual machine.

This code has been developed as part of the research explained in the paper "[Leveraging remote attestation APIs for secure image sharing in messaging apps](https://eprint.iacr.org/2024/2057)". The code is the baseline for [Enhanced Messageme](https://github.com/sam-maverick/enhanced-messageme). This project includes both the client and the server. The client app has been developed with [Expo Go](https://docs.expo.dev/get-started/expo-go/), based on [React Native](https://reactnative.dev/), so that you can run it on Android and iOS devices. The server has been developed with [NestJS](https://nestjs.com/) and uses a [MongoDB](https://www.mongodb.com) self-hosted database in the backend.

We have tested most things on Ubuntu 24.04. The steps we suggest are meant for an isolated lab environment, meaning that it's on your responsibility to check their impact on your particular computing and networking environment.

# Preparing the network environment

If you do not intend to use physical devices, then skip to next section.

You first set up your computer to act as a WiFi Access Point for the phones to connect to. In our lab, the computer is connected to the Internet via an Ethernet cable. We used [create_ap](https://github.com/oblique/create_ap/) in NAT mode, so that the phones can reach both the computer and the Internet without configuring any routing on the computer. Install ifconfig (`sudo apt install ifconfig`) and use the command `ifconfig` to get the interface names.

The installation commands are:

```
apt install hostapd
git clone https://github.com/oblique/create_ap
cd create_ap
make install
```

Below is our `/etc/create_ap.conf`, which creates a hidden WiFi access point. 

```
CHANNEL=default

WPA_VERSION=2

ETC_HOSTS=0
NO_DNS=1
NO_DNSMASQ=0

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
PASSPHRASE=changeme
```

*NOTE: From our experience, by looking at the [Wireshark](https://www.wireshark.org/) traces, create_ap intercepts DNS requests and uses /etc/resolv.conf to forward those requests to external DNS servers. This is not shown in netstat; we suppose that create_ap intercepts the traffic to the virtual interface at the low level. This is also undocumented. To avoid this behavior, use the suggested ETC_HOSTS, NO_DNS and NO_DNSMASQ parameters. With those parameters configured as we suggest, DNS requests are captured by the dnsmasq service.* 

To start the access point, run:

```
systemctl start create_ap
```

To make the service start automatically when you boot up your computer, run:

```
systemctl enable create_ap
```

Note that, in some systems, a virtual interface like 'ap0' is created, which links to the wlan0 physical interface; whereas in other systems the access point is mapped directly to the physical interface (e.g., 'wlp0s20f3'). Using your access point interface name (ap0, wlp0s20f3, or whatever you have), assign it an IP address:

```
ifconfig ap0 192.168.12.1
ifconfig ap0 netmask 255.255.255.0
```



Next, configure your computer to act as a DHCP and DNS server, for it to serve addresses within ap0's subnet. We use [dnsmasq](https://wiki.archlinux.org/title/dnsmasq).

First, make sure that your `/etc/resolv.conf` only contains a loopback address as for nameserver (i.e., no external DNS servers).

These are the installation commands:

```
systemctl start systemd-resolved.service
systemctl enable systemd-resolved.service
sudo apt install dnsmasq
```

These are the main configuration options of our `/etc/dnsmasq.conf`:

```
dhcp-range=192.168.12.100,192.168.12.199,255.255.255.0,12h
bind-interfaces
# It is very important that you specify the interface to listen to, 
# so that you avoid network issues on your other interfaces (e.g., 
# if your eth0 interface is connected to your campus network, you
# will not want to serve IP addresses from your DHCP there)
interface=ap0
# Add as many server entries as DNS resolvers you may want to use
# You may use your corporate DNS servers if you want
server=8.8.8.8
### Leave the rest of the options unchanged!
```

Then,

```
systemctl restart NetworkManager.service
```

Add the entry below to your `/etc/hosts`. NOTE: For the certificate pinning to work in iOS, you'll need to use a standard TLD, as per TrustKit restrictions.

```
# Use 192.168.12.1 when running on network; 10.0.2.2 when running on emulator
# Run `systemctl dnsmasq restart` to apply changes
192.168.12.1    ppserver-gen.localnetwork.org
```

Note that "gen" must correspond to the `PP_PLATFORM_NICKNAME` parameter in `ppclient/src/parameters.js`

*NOTE: From our experience, by looking at the [Wireshark](https://www.wireshark.org/) traces, create_ap bridges the DHCP Discover request frames received from ap0 to our eth0. If you have a DHCP server in your Ethernet network, it will offer IP addresses to the phones within the subnet range of your Ethernet. In other words, your phone will receive two DHCP Offer messages: One from the DHCP server of your computer, and one from the DHCP of your Ethernet network. Because your computer will probably reply faster, this issue will likely come unnoticed. If you run into network issues, you may want to use static IP addresses instead, or to otherwise filter the DHCP frames.*

To start the DHCP server, run:

```
systemctl start dnsmasq
```

**IMPORTANT**: You need to run `systemctl restart dnsmasq` whenever you make changes to `/etc/hosts` and want to apply the changes.

Note that dnsmasq must start after create_ap since its configuration references a network interface created after create_ap is started. To make the service start automatically when you boot up your computer, run:

```
systemctl enable dnsmasq
```



You should now be able to connect via WiFi from your phone. Once connected, check that you have Internet access and that you can ping the computer (there are many free apps to do so).

Also, throughout this guide, remember to open any necessary ports of the firewall of your computer's OS, if necessary.

# Installing the Expo Go development environment

Follow the steps to [install Expo](https://docs.expo.dev/get-started/installation/). See the notes below if you need more help.

For the **Node.js** installation, we used the [installation script](https://github.com/nodesource/distributions#ubuntu-versions):

```
sudo apt-get install curl
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

For **watchman**, if not yet installed, first install curl with

```
sudo apt-get install curl 
```

Then install [brew](https://brew.sh/) with

```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

<u>REMINDER</u>: Don't forget to follow the **Next Steps** that are indicated at the end of the output of the brew installation.

Check:

```
brew -v
```

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
sudo dpkg -i mongodb-org-server_x.y.z_amd64.deb
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

Optionally, install the [MongoDB Compass](https://www.mongodb.com/products/tools/compass). It is a GUI for this database.

# Starting the server

Install NestJS CLI tools, as explained in the [docs](https://docs.nestjs.com/):

```
sudo npm i -g @nestjs/cli
```

From the `server/` folder, start the server:

```
npm start --reset-cache
```

You should get a `Nest application successfully started`.

# Running the app

There are different ways to deploy and launch the Messageme app. Expo Go provides a shell environment to easily and quickly test features. If you want a standalone app that you can publish, then you may want to deploy a production build. Besides, you may want to either use virtual or physical devices. Choose the option(s) below that you want.

The tasks below are to be performed from the `client/` folder.

### Launching the app on an Android device with Expo Go

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
npx expo start --reset-cache
```

Make sure you have only one emulator running, and that no phones connected to your computer via cable. Then, press `a` for `open Android`. It will automatically install the Expo Go app, and launch your app.

For any AVDs you want to use, repeat the same steps: Make sure no other AVD is running and no phone is physically connected to your computer, then press `a`.

Once you have installed the Expo Go on all your AVDs, you can then start all your AVDs at once, run the Expo Go app, launch Messageme, and play with sending and receiving messages.

### Launching the app on an iOS emulator

You should not need an Apple Developer account to use an iOS emulator, but you'll need a Mac to perform this step. The command is:

```
npx expo run:ios
```

### Deploying and launching the app on an Android device directly

This is known as a 'development build'. If you have not already, follow the steps explained in the '<u>Install with adb</u>' section of the [Expo Go 'Build APKs for Android Emulators and devices' guide](https://docs.expo.dev/build-reference/apk/#install-with-adb).

Connect your device to the computer, with a cable. Make sure no other devices are connected, and that no Android emulators are running. The command is:

```
npx expo run:android
```

If you get a "*signatures do not match newer version; ignoring!*" error, you probably already have your app installed from a previous build. Delete the app and repeat the command.

Alternatively, you can use a script we provide, that manages versioning, clears previous build, and performs other helpful tasks:

```
./build.sh managed <patchlevel>
```

where `patchlevel` is patch, minor, or major

### Deploying the APK and running it on an Android device

This is known as a 'production build'. Here we will deploy the app as a bare React Native app. You will need to compile your project to generate the APK file. The [Expo Go 'Create your first build' guide](https://docs.expo.dev/build/setup/) provides the steps to use the EAS cloud service for the compilation. However, we prefer to compile locally, using the [Expo Go 'Local app development' guide](https://docs.expo.dev/guides/local-app-development/). Below is a summary of the steps you need to perform.

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



You can use a script we provide, that manages versioning, clears previous build, and performs other helpful tasks:

```
./build.sh <buildtype> <patchlevel>
```

where `patchlevel` is patch, minor, or major, and `buildtype` is either apk or aab.



Alternatively, instead of build.sh, you can perform the commands below:

```
npx expo prebuild --clean
```

The `--clean` option is usefull if you make major changes (such as the target API version) and you want to make sure that old files are cleared before running the build.

Now, we have to follow steps 1 & 2 from the Expo Go 'Create your first build' guide, so:

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

Finally, if you have not already, follow the steps explained in the '<u>Install with adb</u>' section of the [Expo Go 'Build APKs for Android Emulators and devices' guide](https://docs.expo.dev/build-reference/apk/#install-with-adb). If you get a "*signatures do not match newer version; ignoring!*" error, you probably already have your app installed from a previous build. Delete the app and repeat the APK installation process.

Once you have the app installed in your phone, have fun!

# Acknowledgements

The project that gave rise to these results received the support of a fellowship from ”la Caixa” Foundation (ID 100010434). The fellowship code is LCF/BQ/DI22/11940036. This work was also supported by FCT through the LASIGE Research Unit (UIDB/00408/2020 and UIDP/00408/2020).

# License

This work is licensed under CC BY 4.0. See [LICENSE](LICENSE) for more details.
