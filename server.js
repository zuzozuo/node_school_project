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
var doc, edytujKsiazke, bookCover;
app.set('views', path.join(__dirname, 'views')); // ustalamy katalog views
app.engine('hbs', hbs({
  defaultLayout: 'main.hbs'
})); // domyślny layout, potem można go zmienić
app.set('view engine', 'hbs'); // określenie silnika szablonów
app.use(express.static('static'))
app.use(bodyParser.urlencoded({
  extended: true
}));

/*--------CODE BEGINS HERE----------*/

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
      /*console.log(JSON.stringify({
        "docsy": docs
      }, null, 5))*/
    });

  } else if (req.query.sortuj == "1") {
    ksiazki.find({}).sort({
      tytul: 1
    }).exec(function(err, docs) {
      res.render('index.hbs', {
        "docsy": docs
      });
      /*console.log(JSON.stringify({
        "docsy": docs
      }, null, 5))*/
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

app.post("/addForm", function(req, res) {
  var doc, filename;

  var form = new formidable.IncomingForm();

  form.uploadDir = __dirname + '/static/upload/'
  form.parse(req, function(err, fields, files) {
    var tytul = fields.tytul
    var autor = fields.autor
    var wydawnictwo = fields.wydawnictwo
    var gatunek = fields.gatunek
    var informacje = fields.informacje

    doc = {
      tytul: tytul,
      autor: autor,
      wydawnictwo: wydawnictwo,
      gatunek: gatunek,
      okladka: filename,
      informacje: informacje
    };

    ksiazki.insert(doc, function(err, newDoc) {});

    ksiazki.find({}, function(err, docs) {
      res.render('admin.hbs', {
        "docsy": docs
      })
    })
  })

  form.on('fileBegin', function(name, file) {
    //console.log('Uploaded  ' + file.name);
    file.path = __dirname + '/static/upload/' + file.name
    filename = file.name
  })
});

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
  edytujKsiazke = req.query.edycja
  ksiazki.findOne({
    _id: req.query.edycja
  }, function(err, doc) {
    res.render('edit.hbs', doc)
  })
})

app.post('/editForm2', function(req, res) {
  var form = new formidable.IncomingForm();
  form.uploadDir = __dirname + '/static/upload/'
  form.parse(req, function(err, fields, files) {
    ksiazki.findOne({
      _id: edytujKsiazke
    }, function(err, doc) {
      ksiazki.update(doc, {
        tytul: fields.tytul,
        autor: fields.autor,
        wydawnictwo: fields.wydawnictwo,
        gatunek: fields.gatunek,
        okladka: bookCover
      }, {}, function(err, numReplaced) {
        ksiazki.find({}, function(err, docs) {
          res.render('admin.hbs', {
            "docsy": docs
          })
        })
      })
    })
  })
  form.on('fileBegin', function(name, file) {
    file.path = __dirname + '/static/upload' + file.name
    bookCover = file.name
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
    wydawnictwo: req.query.wydawnictwo,
    okladka: req.query.okladka,
    informacje: req.query.informacje
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

/*---usuwanie pozycji z zamówienia------*/
app.get("/deleteFromBasket", function(req, res) {
  ksiazkiWypozyczone.remove({
    tytul: req.query.tytul
  }, {}, function(err, numRemoved) {});
  ksiazkiWypozyczone.find({}, function(err, items) {
    res.render('basket.hbs', {
      "itemsy": items
    })
  })
})

/*----Usuwanie całej zawartosci koszyka-------*/
app.get("/deleteAllItems", function(req, res) {
  ksiazkiWypozyczone.remove({}, {
    multi: true
  }, function(err, numRemoved) {});
  res.redirect('/goToBasketForm');
})

/*---- Wyswietlanie po itemie--------*/



app.get('/:id', function(req, res) {
  var id = req.params.id

  ksiazki.findOne({
      _id: id
    }, function(err, doc) {
      res.render("wybranaksiazka.hbs", doc)
    })
    /*var item = req.params.item

    if (item == id) {
      ksiazki.find({
        _id: id
      }, function(err, docs) {
        res.render('wybranaksiazka.hbs', {
          "docsy": docs
        })
      })
    } else if (item == tytul) {
      ksiazki.find({
        tytul: id
      }, function(err, docs) {
        res.render('wybranaksiazka.hbs', {
          "docsy": docs
        })
      })
    } else if (item == autor) {
      ksiazki.find({
        autor: id
      }, function(err, docs) {
        res.render('wybranaksiazka.hbs', {
          "docsy": docs
        })
      })
    } else if (item == gatunek) {
      ksiazki.find({
        gatunek: id
      }, function(err, docs) {
        res.render('wybranaksiazka.hbs', {
          "docsy": docs
        })
      })
    } else if (item == wydawnictwo) {
      ksiazki.find({
        wydawnictwo: id
      }, function(err, docs) {
        res.render('wybranaksiazka.hbs', {
          "docsy": docs
        })
      })
    } else {
      res.send("Nie ma takiego tytulu ;(")
    }*/
})


app.listen(PORT, function() {
  console.log("start serwera na porcie " + PORT)
})
