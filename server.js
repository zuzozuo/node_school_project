var http = require("http")
var express = require("express")
var app = express()
var path = require("path")
const PORT = 3000;
var bodyParser = require("body-parser")
var formidable = require('formidable');
var hbs = require('express-handlebars');
var Datastore = require('nedb')
var passwordHash = require('password-hash');
app.set('views', path.join(__dirname, 'views')); // ustalamy katalog views
app.engine('hbs', hbs({
  defaultLayout: 'main.hbs'
})); // domyślny layout, potem można go zmienić
app.set('view engine', 'hbs'); // określenie silnika szablonów
app.use(express.static('static'))
app.use(bodyParser.urlencoded({
  extended: true
}));

/*----------KONIEC PODPINANIA TEGO SZOJSU-----------*/

/*-----baza danych i te sprawy----*/
var ksiazki = new Datastore({
  filename: 'ksiazki.db',
  autoload: true
});

var ksiazkiWypozyczone = new Datastore({
  filename: 'ksiazki_wypozyczone.db',
  autoload: true
});

/*var doc = {
  tytul: "tytul",
  autor: "Imie_Nazwisko",
  wydawnictwo: "Wydawnictwo",
  gatunek: "gatunek"
}


ksiazki.insert(doc, function(err, newDoc) {
  console.log("Dodano dokument(obiekt):")
  console.log(newDoc)
  console.log("losowe id dokumentu: " + newDoc._id)
})*/

/*------ wyświetlanie ---------*/

app.get("/", function(req, res) {
  ksiazki.find({}, function(err, docs) {
    res.render('index.hbs', {
      "docsy": docs
    })
  })
})


/*---- wyszukiwanie tytulu --------*/
app.get("/searchForm", function(req, res) {
  ksiazki.find({
    tytul: req.query.szukajTytul
  }, function(err, docs) {
    res.render('index.hbs', {
      "docsy": docs
    });
  });
});

/*----- wyszukiwanie autora-------*/
app.get("/searchForm2", function(req, res) {
  ksiazki.find({
    autor: req.query.szukajAutora
  }, function(err, docs) {
    res.render('index.hbs', {
      "docsy": docs
    });
  });
});

/*-------wyszukiwanie wydawnictwa---------*/
app.get("/searchForm3", function(req, res) {
  ksiazki.find({
    wydawnictwo: req.query.szukajWydawnictwa
  }, function(err, docs) {
    res.render('index.hbs', {
      "docsy": docs
    });
  });
});
/*------- wyszukiwanie gatunku--------*/

app.get("/searchForm4", function(req, res) {
  ksiazki.find({
    gatunek: req.query.szukajGatunku
  }, function(err, docs) {
    res.render('index.hbs', {
      "docsy": docs
    });
  });
});


/*---------sortowanie-------------------*/

app.get("/sortForm", function(req, res) {
  if (req.query.sortuj == "-1") {
    ksiazki.find({}).sort({
      tytul: -1
    }).exec(function(err, docs) {
      res.render('index.hbs', {
        "docsy": docs
      });
      console.log(JSON.stringify({
        "docsy": docs
      }, null, 5))
    });

  } else if (req.query.sortuj == "1") {
    ksiazki.find({}).sort({
      tytul: 1
    }).exec(function(err, docs) {
      res.render('index.hbs', {
        "docsy": docs
      });
      console.log(JSON.stringify({
        "docsy": docs
      }, null, 5))
    });
  }
});


/*------LOGOWANIE---------*/

var daneLogowania = {
  login: "admin",
  haslo: "admin"
};

var zahashowaneHaslo = passwordHash.generate(daneLogowania.haslo)

/*---przejście do panelu logowania ----*/
app.post("/logonForm", function(req, res) {
  var haslo2 = req.body.password;
  var czyPoprawne = passwordHash.verify(haslo2, zahashowaneHaslo)
  var login2 = req.body.login

  if (czyPoprawne == true && login2 == daneLogowania.haslo) {
    ksiazki.find({}, function(err, docs) {
      res.render('admin.hbs', {
        "docsy": docs
      })
    })
  } else {
    res.render('error.hbs');
  }
});


/*-------PANEL ADMINA--------*/

/*---dodawanie do bazy ----*/

app.get("/addForm", function(req, res) {
    var doc2 = {
      tytul: req.query.tytul,
      autor: req.query.autor,
      wydawnictwo: req.query.wydawnictwo,
      gatunek: req.query.gatunek
    }

    ksiazki.insert(doc2, function(err, newDoc) {});
    ksiazki.find({}, function(err, docs) {
      res.render('admin.hbs', {
        "docsy": docs
      })
    });
  })
  /*-----usuwanie z bazy----*/
app.get("/deleteForm", function(req, res) {
    ksiazki.remove({
      tytul: req.query.tytul
    }, {}, function(err, numRemoved) {});
    ksiazki.find({}, function(err, docs) {
      res.render('admin.hbs', {
        "docsy": docs
      })
    })
  })
  /*-------edycja danych w bazie----------*/

app.get("/editForm", function(req, res) {
  var nazwa = req.query.tytul;
  var autor = req.query.autor
  var wydawnictwo = req.query.wydawnictwo
  var gatunek = req.query.gatunek

  ksiazki.find({
    tytul: nazwa
  }, function(err, docs) {
    res.render("edit.hbs", {
      "docsy": docs
    });
  })
})


/*---- wyloguj sie ------*/
app.get("/logoutForm", function(req, res) {
  ksiazki.find({}, function(err, docs) {
    res.render('index.hbs', {
      "docsy": docs
    })
  })
})

app.get("/backForm", function(req, res) {
  ksiazki.find({}, function(err, docs) {
    res.render('index.hbs', {
      "docsy": docs
    })
  })
})

/*------KOSZYK/ZAMÓWIENIA-----*/
/*--- dodanie zamówionych itemów----*/
app.get("/addToBasketForm", function(req, res) {
  var item = {
    tytul: req.query.tytul,
    autor: req.query.autor,
    gatunek: req.query.gatunek,
    wydawca: req.query.wydawca
  };
  ksiazkiWypozyczone.insert(item, function(err, newItem) {});
  res.redirect('/')
})

/*-----przejście do strony z koszykiem---*/
app.get("/goToBasketForm", function(req, res) {
  ksiazkiWypozyczone.find({}, function(err, items) {
      res.render("basket.hbs", {
        "itemsy": items
      })
    })
    //res.render("basket.hbs")
})



app.listen(PORT, function() {
  console.log("start serwera na porcie " + PORT)
})
