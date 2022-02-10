const pg = require("pg")
const client = new pg.Client('postgres://localhost/warehouse')
const express = require("express")

const app = express();

const port = 3000;

app.listen(port, () => {
  console.log(`listening on port ${port}`)
})

app.get('/', async(req, res, next) => {
  try {
    const response = await client.query("SELECT * FROM inventory")
    const inv = response.rows
    res.send(`
    <html>
    <title> Warehouse Inventory </title>
      <h1>
        <a href='/'>
        Inventory
        </a>
      </h1>
      <body>
      Products
      </body>
      <ul>
        ${inv.map(product => `
        <li>
          <a href='/products/${product.location}'>
          ${product.item}
          </a>
        </li>
        `).join('')}
      </ul>
    </html>
    `)
  }
  catch(ex){
    next(ex)
  }
})

app.get('/products/:location', async(req, res, next) => {
  try {
    const response = await client.query("SELECT * FROM inventory WHERE location=$1", [req.params.location])
    const inv = response.rows
    res.send(`
    <html>
    <title> Warehouse Inventory </title>
      <h1>
        <a href='/'>
        Inventory
        </a>
      </h1>
      <body>
      Products
      </body>
      <ul>
        ${inv.map(product => `
        <li>
          <a href='/products/${product.location}'>
          ${product.item}
          </a>
        </li>
        `).join('')}
      </ul>
    </html>
    `)
  }
  catch(ex){
    next(ex)
  }
})

const syncAndSeed = async() => {
  const SQL = `
  DROP TABLE IF EXISTS inventory;
  CREATE TABLE inventory(
    ORG varchar(255),
    SUBINVENTORY varchar(255),
    ITEM varchar(255),
    LOCATION varchar(255)
  );
  INSERT INTO inventory(ORG, SUBINVENTORY, ITEM, LOCATION) VALUES('PAD', 'BP-A', 'HY144-D', '570801');
  INSERT INTO inventory(ORG, SUBINVENTORY, ITEM, LOCATION) VALUES('PAD', 'BP-A', 'HY256-TL', '570802');
  INSERT INTO inventory(ORG, SUBINVENTORY, ITEM, LOCATION) VALUES('PAD', 'BP-A', 'NY64-D', '570601');
  `
  await client.query(SQL)
}

const setUp = async() => {
  try {
    await client.connect()
    await syncAndSeed();
    console.log("connected to database")
  }
  catch (ex) {
    console.log(ex)
  }
}

setUp();