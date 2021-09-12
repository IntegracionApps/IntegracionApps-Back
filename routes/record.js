const express = require("express");

// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const recordRoutes = express.Router();

//"Importamos" el código necesario para conectarse al Clúster de MongoDB Atlas
const dbo = require("../db/conn");

//-----PRODUCTOS-----
// Obtener todos los productos.
recordRoutes.route("/Products/get/all").get(function (req, res) {
  let db_connect = dbo.getDb("supermercado");
  db_connect
    .collection("Producto")
    .find({})
    .toArray(function (err, result) {
      if (err) throw err;
      res.json(result);
    });
});

//Obtener un Producto por su ID
recordRoutes.route("/Products/get/:id").get(function (req, res) {
  let db_connect = dbo.getDb("supermercado");
  let myquery = { id: req.params.id };
  db_connect
    .collection("Producto")
    .find(myquery)
    .toArray(function (err, result) {
      if (err) throw err;
      res.json(result);
    });
});

// Actualizar el stock de un producto según su ID.
recordRoutes.route("/Products/update/:id").post(function (req, res) {
  console.log(req.params.id);
  console.log(req.body.newQuantity);
  let db_connect = dbo.getDb("supermercado");
  let myquery = { id: req.params.id };
  let newvalues = {
    $set: {
      stock: req.body.newQuantity,
    },
  };
  db_connect
    .collection("Producto")
    .updateOne(myquery, newvalues, function (err, res) {
      if (err) throw err;
      console.log("1 document updated");
    });
  res.json(res.status + " " + res.statusMessage);
});

//-------------

//------USUARIOS------
//Obtener todos los EMPLEADOS ACTIVOS
recordRoutes.route("/Users/get/all").get(function (req, res) {
  let db_connect = dbo.getDb("supermercado");
  // let myquery = { disponible: "si" }
  db_connect
    .collection("Usuario")
    .find({ disponible: "si" })
    .toArray(function (err, result) {
      if (err) throw err;
      res.json(result);
    });
});

//Obtener un usuario por su ID.
recordRoutes.route("/Users/get/:id").get(function (req, res) {
  let db_connect = dbo.getDb("supermercado");
  let myquery = { id: req.params.id };
  db_connect
    .collection("Usuario")
    .find(myquery)
    .toArray(function (err, result) {
      if (err) throw err;
      res.json(result);
    });
  // console.log(result);
});


// This section will help you create a new record.
recordRoutes.route("/add").post(function (req, res) {
  let db_connect = dbo.getDb("employees");
  let myobj = {
    person_name: req.body.person_name,
    person_position: req.body.person_position,
    person_level: req.body.person_level,
  };
  db_connect.collection("records").insertOne(myobj, function (err, res) {
    if (err) throw err;
  });
});




// This section will help you delete a record
recordRoutes.route("/delete/:id").delete((req, res) => {
  let db_connect = dbo.getDb("employees");
  var myquery = { id: req.body.id };
  db_connect.collection("records").deleteOne(myquery, function (err, obj) {
    if (err) throw err;
    console.log("1 document deleted");
  });
});

module.exports = recordRoutes;
