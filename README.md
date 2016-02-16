## Сборка

Предварительно требуется глобальная установка webpack
```
npm install
webpack
```

### Выборка строений через Overpass

Ссылка http://overpass-turbo.eu/
```
[out:json][timeout:25];
(
  way["building"]({{bbox}});  
);
out body;
>;
out skel qt;



//way(poly:"50.7 7.1 50.7 7.2 50.75 7.15")["building"];
//(._;>;);
//out body;
```