const { Double, Int32 } = require("bson");
const { json } = require("express");
const express = require("express");

// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const recordRoutes = express.Router();

//"Importamos" el código necesario para conectarse al Clúster de MongoDB Atlas
const dbo = require("../db/conn");

let idVenta = 0;

//-----PRODUCTOS-----
// Obtener todos los productos con stock (para el HOME).
recordRoutes.route("/Products/get/withStock").get(function (req, res) {
  let db_connect = dbo.getDb("supermercado");
  db_connect
    .collection("Producto")
    .find({ stock: { $gt: 0 } })
    .sort({ id: 1 })
    .toArray(function (err, result) {
      if (err) throw err;
      res.json(result);
    });
});

// Obtener todos los productos (para el ADMIN).
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

recordRoutes.route("/Products/add/").post((req, res) => {
  let db_connect = dbo.getDb("supermercado");
  let myobj = {
    nombre: req.body.producto.nombre,
    descrip: req.body.producto.descripcion,
    categoria: req.body.producto.categoria,
    tipoUnidad: req.body.producto.tipoUnidad,
    price: new Double(parseFloat(req.body.producto.price)),
    stock: new Int32(parseInt(req.body.producto.stock)),
    puntoRepo: new Int32(parseInt(req.body.producto.puntoRepo)),
  }

  db_connect.collection("Producto").insertOne(myobj, function (err, result) {
    if (err) throw err;
    res.status(200).json("Se ha creado el producto exitosamente!")
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

recordRoutes.route("/Products/update").post(function (req, res) {
  console.log("IN");
  let db_connect = dbo.getDb("supermercado");
  let myquery = { descrip: req.body.producto.descrip };
  let newvalues = {
    $set: {
      // id: req.body.producto.id,
      nombre: req.body.producto.nombre,
      descrip: req.body.producto.descrip,
      categoria: req.body.producto.categoria,
      tipoUnidad: req.body.producto.tipoUnidad,
      price: new Double(parseFloat(req.body.producto.price)),
      stock: new Int32(parseInt(req.body.producto.stock)),
      puntoRepo: new Int32(parseInt(req.body.producto.puntoRepo)),
    },
  };
  db_connect
    .collection("Producto")
    .updateOne(myquery, newvalues, function (err, res) {
      if (err) throw err;
      // console.log("1 document updated");
      // console.log(res);
    });
  res.json(res.status + " " + res.statusMessage);
});


// Actualizar el stock de un producto según su ID.
recordRoutes.route("/Products/update/:id").post(function (req, res) {
  let db_connect = dbo.getDb("supermercado");
  let myquery = { id: parseInt(req.params.id) };
  let newvalues = {
    $set: {
      stock: req.body.newQuantity,
    },
  };
  db_connect
    .collection("Producto")
    .updateOne(myquery, newvalues, function (err, res) {
      if (err) throw err;
      // console.log("1 document updated");
      // console.log(res);
    });
  res.json(res.status + " " + res.statusMessage);
});


recordRoutes.route("/Products/delete/:id").post(function (req, res) {
  console.log(req.params);
  let db_connect = dbo.getDb("supermercado");
  let myquery = {
    id: parseInt(req.params.id),
  }
  db_connect
    .collection("Producto")
    .deleteOne(myquery, function (err, result) {
      if (err) throw err;
      console.log(result);
      if (result.deletedCount >= 1) res.status(200).json("Se ha eliminado el producto con éxito.")
      else res.status(200).json("No se ha encontrado un producto con el ID: " + req.params.id)
      res.status(result);
    });
});


//-------------

//------USUARIOS------
//Obtener todos los EMPLEADOS ACTIVOS
recordRoutes.route("/Users/get/all").get(function (req, res) {
  let db_connect = dbo.getDb("supermercado");
  let myquery = {
    $and: [
      {
        disponible: true
      }, {
        $or: [
          {
            rol: 'Empleado'
          }, {
            rol: 'Administrador'
          }
        ]
      }
    ]
  }
  db_connect
    .collection("Usuario")
    .find(myquery)
    .toArray(function (err, result) {
      if (err) throw err;
      res.json(result);
    });
});

//Obtener un usuario por su E-Mail.
//REVISAR
recordRoutes.route("/Users/get/").post(function (req, res) {
  let db_connect = dbo.getDb("supermercado");
  let myquery = { email: req.body.cliente.email };
  db_connect
    .collection("Usuario")
    .findOne(myquery, function (err, result) {
      if (err) throw err;
      if (result !== null) {
        if (result.password !== req.body.cliente.password) res.json(false);
        else {
          const user = {
            nombre: result.nombre,
            apellido: result.apellido,
            ubicacion: {
              direccion: result.ubicacion.direccion,
              altura: result.ubicacion.altura,
              piso: result.ubicacion.piso,
            },
            email: result.email,
            dni: result.dni,
            telefono: result.telefono,
            rol: result.rol,
          }
          res.json(user);
        };
      }
      else res.status(404).json("No está registrado ningún usuario con el mail: " + req.body.cliente.email);
    });
});

// Borrar un usuario por su ID
recordRoutes.route("/Users/delete/:id").post((req, res) => {
  let db_connect = dbo.getDb("supermercado");
  // console.log(typeof(req.params.id));
  var myquery = { id: parseInt(req.params.id) };
  let newvalues = {
    $set: { disponible: false },
  }
  // console.log(myquery.id);
  db_connect.collection("Usuario").updateOne(myquery, newvalues, function (err, obj) {
    if (err) throw err;
    console.log("1 document deleted");
  });
  res.status(200).json("La baja se ha realizado con éxito!")
});

//Crear un nuevo CLIENTE
recordRoutes.route("/Users/add/client").post((req, res) => {
  let db_connect = dbo.getDb("supermercado");
  let myobj = {
    dni: req.body.cliente.dni,
    cuil: req.body.cliente.cuil,
    nombre: req.body.cliente.nombre,
    apellido: req.body.cliente.apellido,
    email: req.body.cliente.email,
    ubicacion: {
      direccion: req.body.cliente.direccion,
      altura: req.body.cliente.altura,
      piso: req.body.cliente.piso,
    },
    telefono: req.body.cliente.telefono,
    rol: 'Cliente',
    disponible: true,
  }

  db_connect.collection("Usuario").insertOne(myobj, function (err, result) {
    if (err) throw err;
    res.status(200).json("¡Has sido registrado exitosamente!")
  })
});

//Crear un nuevo EMPLEADO o ADMINISTRADOR
recordRoutes.route("/Users/add/employee").post((req, res) => {
  let db_connect = dbo.getDb("supermercado");
  let myobj = {
    dni: req.body.cliente.dni,
    cuil: req.body.cliente.cuil,
    nombre: req.body.cliente.nombre,
    apellido: req.body.cliente.apellido,
    email: req.body.cliente.email,
    ubicación: {
      direccion: req.body.cliente.direccion,
      altura: req.body.cliente.altura,
      piso: req.body.cliente.piso,
    },
    teléfono: req.body.cliente.telefono,
    rol: req.body.cliente.rol,
    salario: req.body.cliente.salario,
    disponible: true,
  }

  db_connect.collection("Usuario").insertOne(myobj, function (err, result) {
    if (err) throw err;
    res.status(200).json("¡Has sido registrado exitosamente!")
  })
});

//Editar un EMPLEADO/ADMINISTRADOR
recordRoutes.route("/Users/edit/employee").post((req, res) => {
  let db_connect = dbo.getDb("supermercado");
  console.log(req.body);
  let myquery = {
    id: req.body.empleado.id,
  }
  let newvalues = {
    $set: {
      email: req.body.empleado.email,
      ubicacion: {
        direccion: req.body.empleado.ubicacion.direccion,
        altura: req.body.empleado.ubicacion.altura,
        piso: req.body.empleado.ubicacion.piso,
      },
      telefono: req.body.empleado.telefono,
      salario: new Double(parseFloat(req.body.empleado.salario)),
    }
  }
  db_connect.collection("Usuario").updateOne(myquery, newvalues, function (err, result) {
    if (err) throw err;
    res.status(200).json("¡Has sido modificado exitosamente!")
  })
});


//-------------

//------VENTAS------

//Buscar todas las ventas
recordRoutes.route("/Sales/get/:salesSelect").get(function (req, res) {
  let db_connect = dbo.getDb("supermercado");
  if (req.params.salesSelect === "0") {
    db_connect
      .collection("Venta")
      .find({})
      .sort({ id: 1 })
      .toArray(function (err, result) {
        if (err) throw err;
        res.json(result);
      });
  } else {
    let myquery = {
      "cliente.dni": req.params.salesSelect
    };
    db_connect
      .collection("Venta")
      .find(myquery)
      .sort({ id: 1 })
      .toArray(function (err, result) {
        if (err) throw err;
        res.json(result);
      });

  }
});


// Crear nueva venta
recordRoutes.route("/add").post(function (req, res) {
  let db_connect = dbo.getDb("supermercado");
  console.log(req.body.count);
  let myobj = {
    //REVISAR
    // _id: req.body.countSales + 1,
    fechaEmision: req.body.values.fechaEmision,
    cliente: {
      nombre: req.body.values.nombre,
      apellido: req.body.values.apellido,
      ubicacion: {
        direccion: req.body.values.direccion,
        altura: req.body.values.altura,
        piso: req.body.values.piso,
      },
      DNI: req.body.values.dni,
      email: req.body.values.email,
      telefono: req.body.values.telefono,
    },
    items: req.body.values.items,
    subTotal: req.body.values.subTotal,
    total: req.body.values.total,
    descuentoTotal: req.body.values.descuentoTotal,
    medioPago: req.body.values.medioPago,
    pagoRealizado: req.body.values.pagoRealizado,
    vuelto: req.body.values.vuelto,
    estado: req.body.values.estado,
    sucursal: req.body.values.sucursal,
    otros1: req.body.values.otros1,
    otros2: req.body.values.otros2,
  };
  // console.log(myobj.pagoRealizado);
  // console.log(myobj);

  myobj.items.forEach(item => {
    db_connect
      .collection("Producto")
      .find({ id: item.id })
      .toArray(function (err, result) {
        if (err) throw err;
        console.log(result);
        aux = json(result[0]);
        console.log(aux.stock);
      });
    // console.log(aux.stock);
    db_connect
      .collection("Producto")
      .updateOne({ id: item.id }, { $inc: { stock: -item.quantity } }, function (err, result) {
        if (err) throw err;
        console.log("1 document updated.");
      });
  });

  db_connect.collection("Venta").insertOne(myobj, function (err, res) {
    if (err) throw err;
    console.log(res);
  });
  res.json();
});


//------------

//------SUPERMERCADO------
recordRoutes.route("/Markets/get/all").get(function (req, res) {
  let db_connect = dbo.getDb("supermercado");
  db_connect
    .collection("Supermercado")
    .findOne({}, { $project: { _id: 0 } }, function (err, result) {
      if (err) throw err;
      res.json(result);
    });
});





module.exports = recordRoutes;
