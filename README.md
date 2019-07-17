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

Aby skrypt zadziałał na systemie Linux, musi być na nim zainstalowane graficzne środowisko użytkownika (np. GNOME), ponieważ w skrypcie jest wykorzystywany Electron (https://pl.wikipedia.org/wiki/Electron_(oprogramowanie) - przeglądarka oparta na Chromium). Skrypt w tym celu potrzebuje wyświetlić podaną stronę, wywołać do niej skrypty JS, żeby pobrały się dane o aukcjach, na których później może opracować kanał RSS.

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

Na wypadek, gdyby w skrypcie wystąpił błąd i chcemy, żeby wykonał się automatyczny restart skryptu, to można w tym celu wykorzystać menedżer procesów Node.js: http://pm2.keymetrics.io/

Żeby utworzony kanał był dostępny w Internecie, należy w systemie operacyjnym postawić serwer WWW (IIS, Apache, Nginx, Lighttpd) i przekierować http://localhost:4000/ na adres IP komputera, na którym jest wykonywany skrypt. W przypadku Ubuntu można skorzystać z tego poradnika: https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-16-04 

## Jak stworzyć kanał RSS?

1. Wejdź w wybraną przez Ciebie kategorię na stronie allegro.pl i ustaw parametry wyszukiwania. 

![alt tag](https://raw.githubusercontent.com/MK-PL/AllegroRSS/master/img/img1.png)

2. Ustaw sortowanie aukcji po najnowszych, żeby śledzić najnowsze aukcje w kanale RSS. W kanale RSS domyślnie wyświetlane są aukcje z trzech pierwszych podstron z wynikami. 

![alt tag](https://raw.githubusercontent.com/MK-PL/AllegroRSS/master/img/img2.png)

3. Przekopiuj link URL z pola adresu WWW przeglądarki. Powinny być w nim zamieszczone parametry wyszukiwania.

![alt tag](https://raw.githubusercontent.com/MK-PL/AllegroRSS/master/img/img3.png)

4. Wprowadź adres do wskazanego pola na stronie internetowej skryptu (domyślnie http://localhost:4000/index.html) i naciśnij przycisk "Generuj".

![alt tag](https://raw.githubusercontent.com/MK-PL/AllegroRSS/master/img/img4.png)

5. Zostanie wygenerowany kanał RSS z aukcjami o podanych parametrach wyszukiwaniach, jak w podanym adresie URL do serwisu Allegro.

![alt tag](https://raw.githubusercontent.com/MK-PL/AllegroRSS/master/img/img5.png)

## Co zostało użyte do zrobienia AllegroRSS?

- HTML/CSS/JS/NODE.JS
- MODUŁY NODE.JS: HTTP, FS, URL, NIGHTMARE, VO, FEED

## Zmiany

- 0.2.6 Naprawienie linków sponsorowanych.
- 0.2.4 Przywrócenie wyświetlania cen w kanale RSS.
- 0.2.3 Naprawienie miniaturek w kanale RSS.
- 0.2.2 Naprawienie usterki, która uniemożliwiała działanie skryptu, poprawki w kodzie.
- 0.2.1 Naprawienie usterki, która uniemożliwiała działanie skryptu.
- 0.2.0 Naprawienie usterek, które duplikowały oferty sponsorowane w kanale RSS oraz pokazywały wyłącznie oferty sponsorowane ze spodu listy wyników.
- 0.1.9 Naprawienie usterki, która uniemożliwiała działanie skryptu.
- 0.1.8 Przerobienie skryptu, żeby zwracał pusty kanał RSS, gdy nie ma aktywnych aukcji w podanym adresie URL, poprawki w kodzie.
- 0.1.7 Przerobienie skryptu, żeby zwracał komunikat, gdy nie ma aktywnych aukcji w podanym adresie URL.
- 0.1.6 Modyfikacja kodu - wyświetlanie użytego adresu URL w komunikatach o generowaniu kanału RSS.
- 0.1.5 Modyfikacja kodu - moduł Electron teraz się wyłącza w przypadku wystąpienia błędu i nie zajmuje niepotrzebnie pamięci RAM, drobne poprawki w kodzie, modyfikacja opisu skryptu.
- 0.1.4 Przerobienie skryptu, żeby się nie wyłączał w momencie wystąpienia błędu, drobne poprawki w kodzie, modyfikacja opisu skryptu.
- 0.1.3 Poprawki w kodzie.
- 0.1.0 Start skryptu.

## Błędy

Wykryte błędy proszę zgłaszać w sekcji 'Issues' projektu - dzięki temu inni użytkownicy będą mogli zapoznać się z problemem (zwłaszcza, jeśli mają podobny) i ewentualnie zaproponować swoje rozwiązania.

## Autor

Maciej Kawa

kontakt [at] maciejkawa.lubin.pl