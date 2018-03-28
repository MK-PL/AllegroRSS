# Allegro RSS

Allegro RSS jest generatorem kanału RSS, który w porównaniu do standardowego generatora Allegro.pl, pozwala również na spersonalizowanie wszystkich parametrów wyszukiwania.

## Jak zainstalować?

Instalacja Node.js i skryptu na systemie Windows:

1. Wejdź na stronę: https://nodejs.org/en/, ściągnij Node.js i zainstaluj na systemie.
2. Po instalacji Node.js otwórz wiersz polecenia i wejdź do katalogu (polecenia 'cd nazwa_katalogu' i 'cd ..'), gdzie znajdują się pliki od skryptu, a dokładniej plik package.json.
3. Wpisz w wierszu polecenia 'npm install -g' i poczekaj, aż ściągną się wymagane moduły Node.js.
4. Wpisz w wierszu polecenia 'node index.js' i otwórz w przeglądarce adres http://localhost:4000/index.html.
5. W okienku wklej adres podstrony z wynikami wyszukiwania do Allegro i naciśnij 'Generuj'.
6. Zostanie wygenerowany kanał RSS o określonym adresie URL. Jego odświeżenie spowoduje ponowne wykonanie skryptu i zaktualizowanie kanału RSS (skrypt musi być w tym czasie ciągle włączony - patrz punkt 4).

Instalacja Node.js i skryptu na systemie Linux:

1. Wejdź na stronę https://nodejs.org/en/download/package-manager/, są tu podane polecenia do odpowiednich dystrybucji, które trzeba wprowadzić w terminalu, żeby zainstalować Node.js.
2. Po instalacji Node.js otwórz terminal i wejdź do katalogu (polecenia 'cd nazwa_katalogu' i 'cd ..'), gdzie znajdują się pliki od skryptu, a dokładniej plik package.json.
3. Wpisz w oknie terminala 'npm install -g' i poczekaj, aż ściągną się wymagane moduły Node.js.
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

## Co zostało użyte do zrobienia Allegro RSS?

- HTML/CSS/JS/NODE.JS
- MODUŁY NODE.JS: HTTP, FS, URL, QUERYSTRING, NIGHTMARE, VO, FEED

## Autor

Maciej Kawa

kontakt [at] maciejkawa.lubin.pl
