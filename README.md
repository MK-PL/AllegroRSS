# AllegroRSS

AllegroRSS jest generatorem kanału RSS, który w porównaniu do standardowego generatora Allegro.pl, pozwala również na spersonalizowanie wszystkich parametrów wyszukiwania.

## Jak zainstalować?

### Instalacja Node.js i skryptu na systemie Windows:

1. Wejdź na stronę: https://nodejs.org/en/, ściągnij Node.js i zainstaluj na systemie.
2. Po instalacji Node.js otwórz wiersz polecenia i wejdź do katalogu, gdzie znajdują się pliki od skryptu, a dokładniej plik package.json (można użyć polecenia 'cd nazwa_katalogu' i 'cd ..').
3. Wpisz w wierszu polecenia 'npm install' i poczekaj, aż ściągną się wymagane moduły Node.js.
4. Wpisz w wierszu polecenia 'node index.js' i otwórz w przeglądarce adres http://localhost:4000/index.html.
5. W okienku wklej adres podstrony z wynikami wyszukiwania do Allegro i naciśnij 'Generuj'.
6. Zostanie wygenerowany kanał RSS o określonym adresie URL. Jego odświeżenie spowoduje ponowne wykonanie skryptu i zaktualizowanie kanału RSS (skrypt musi być w tym czasie ciągle włączony - patrz punkt 4).

### Instalacja Node.js i skryptu na systemie Linux:</b>

<b>Uwaga!</b>

Aby skrypt zadziałał na systemie Linux, musi być na nim zainstalowane graficzne środowisko użytkownika (np. GNOME), ponieważ  jest wykorzystywany w skrypcie Electron (https://pl.wikipedia.org/wiki/Electron_(oprogramowanie) - przeglądarka oparta na Chromium). Skrypt w tym celu potrzebuje wyświetlić podaną stronę, wywołać do niej skrypty JS, żeby pobrały się dane o aukcjach, na których później może opracować kanał RSS.

W przypadku serwerów z Linuxem, w których komunikacja odbywa się domyślnie po SSH, można doinstalować środowisko graficzne oraz program do zdalnego sterowania (np. NoMachine).

Na serwerze z Ubuntu po połączeniu SSH trzeba wpisać poniższe polecenia:

1. sudo apt update
2. sudo apt install ubuntu-gnome-desktop
3. wget http://download.nomachine.com/download/6.0/Linux/nomachine_6.0.78_1_amd64.deb
4. sudo dpkg -i nomachine_6.0.78_1_amd64.deb

Po wszystkim trzeba jeszcze zainstalować program NoMachine na swoim komputerze i połączyć się w nim z serwerem wykorzystując dane logowania do SSH (IP, dane użytkownika) i przejść do poniższych instrukcji.

---

1. Wejdź na stronę https://nodejs.org/en/download/package-manager/, są tu podane polecenia do odpowiednich dystrybucji, które trzeba wprowadzić w terminalu, żeby zainstalować Node.js.
2. Po instalacji Node.js otwórz terminal i wejdź do katalogu, gdzie znajdują się pliki od skryptu, a dokładniej plik package.json (polecenia 'cd nazwa_katalogu' i 'cd ..').
3. Wpisz w oknie terminala 'sudo npm install' i poczekaj, aż ściągną się wymagane moduły Node.js.
4. Wpisz w oknie terminala 'node index.js' i otwórz w przeglądarce adres http://localhost:4000/index.html.
5. W okienku wklej adres podstrony z wynikami wyszukiwania do Allegro i naciśnij 'Generuj'.
6. Zostanie wygenerowany kanał RSS o określonym adresie URL. Jego odświeżenie spowoduje ponowne wykonanie skryptu i zaktualizowanie kanału RSS (skrypt musi być w tym czasie ciągle włączony - patrz punkt 4).

Na wypadek, gdyby w skrypcie wystąpił błąd i chcemy, żeby wykonał się automatyczny restart, to można w tym celu wykorzystać menedżer procesów Node.js: http://pm2.keymetrics.io/

## Jak stworzyć kanał RSS?

1. Wejdź w wybraną przez Ciebie kategorię na stronie allegro.pl i ustaw parametry wyszukiwania.
![alt tag](https://raw.githubusercontent.com/MK-PL/AllegroRSS/master/img/img1.png)
2. Przekopiuj link z pola adresu WWW przeglądarki, w którym będą umieszczone parametry wyszukiwania.
![alt tag](https://raw.githubusercontent.com/MK-PL/AllegroRSS/master/img/img2.png)
3. Wprowadź adres do wskazanego pola na stronie internetowej skryptu i naciśnij przycisk "Generuj".
![alt tag](https://raw.githubusercontent.com/MK-PL/AllegroRSS/master/img/img3.png)
4. Zostanie wygenerowany kanał RSS z aukcjami o podanych parametrach wyszukiwaniach, jak w podanym adresie do serwisie Allegro.
![alt tag](https://raw.githubusercontent.com/MK-PL/AllegroRSS/master/img/img4.png)

## Co zostało użyte do zrobienia AllegroRSS?

- HTML/CSS/JS/NODE.JS
- MODUŁY NODE.JS: HTTP, FS, URL, NIGHTMARE, VO, FEED

## Autor

Maciej Kawa

kontakt [at] maciejkawa.lubin.pl