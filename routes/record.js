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

//Obtener un usuario por su E-Mail.
recordRoutes.route("/Users/get/:email").get(function (req, res) {
  let db_connect = dbo.getDb("supermercado");
  let myquery = { email: req.params.email };
  db_connect
    .collection("Usuario")
    .find(myquery)
    .toArray(function (err, result) {
      if (err) throw err;
      res.json(result);
      console.log(result);
    });
});
//-------------

//------VENTAS------

recordRoutes.route("/Sales/get/all").get(function (req, res) {
  let db_connect = dbo.getDb("supermercado");
  db_connect
    .collection("Venta")
    .find({})
    .toArray(function (err, result) {
      if (err) throw err;
      res.json(result);
    });
});

// Crear nueva venta
recordRoutes.route("/add").post(function (req, res) {
  let db_connect = dbo.getDb("supermercado");
  // console.log(req.body);
  let myobj = {
    //REVISAR
    // id: new Number(),
    fechaEmision: req.body.values.fechaEmision,
    cliente: req.body.values.cliente,
    items: req.body.values.items,
    subTotal: req.body.values.subTotal,
    total: req.body.values.total,
    descuentoTotal: req.body.values.descuentoTotal,
    medioPago: req.body.values.medioPago,
    pagoRealizado: req.body.values.pagoRealizado,
    vuelto: req.body.values.vuelto,
    estado: req.body.values.estado,
  };
  // console.log(myobj.pagoRealizado);
  // console.log(myobj.vuelto);

  db_connect.collection("Venta").insertOne(myobj, function (err, res) {
    if (err) throw err;
    console.log(res);
  });
  res.json();
});

//------------





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
