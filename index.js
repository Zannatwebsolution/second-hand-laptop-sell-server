const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

app.use(express.json());
app.use(cors());

const uri = process.env.URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// Collection
const Users = client.db("secondHandLaptop").collection("users");
const Category = client.db("secondHandLaptop").collection("categories");
const Products = client.db("secondHandLaptop").collection("products");
const Order = client.db("secondHandLaptop").collection("order");
const Blogs = client.db("secondHandLaptop").collection("blogs");

async function run() {
  try {
    await client.connect();
    console.log("Database Connect Successful");

    // Create Jwt Token
    app.post("/createJwtToken", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "30d",
      });
      res.send({
        data: token,
        success: true,
        message: "JWT Token Generate Successful",
      });
    });

    

  

    // User Admin
    app.put("/users/admin/:id", verifyJwt, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const option = { upsert: true };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await Users.updateOne(filter, updateDoc, option);
      res.send(result);
    });

    // Get Admin
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await Users.findOne(query);
      const role = user?.role;
      console.log(role)
      res.send({ role: role });
    //   res.send({ isAdmin: user?.role === "admin" });
    });
  } catch (error) {
    console.log(error.message);
  }
}
run();

app.get("/", (req, res) => {
  res.send("Done");
});
// Verify JWT Token
function verifyJwt(req, res, next) {
    const authHeader = req.headers.authorization;
    console.log(authHeader)
    if (!authHeader) {
      return res.status(401).send({ message: "unauthorized" });
    }
    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).send({ massage: "unauthorized" });
      }

      req.decoded = decoded;
      next();
    });
  }

  const verifyAdmin =async (req, res, next)=>{
    const decodedEmail = req.decoded.email;
    const query = {email: decodedEmail};
    const user = await Users.findOne(query);
    if(user?.role !== "admin"){
       return res.status(403).send({message: "Forbidden Access"})
    }

    next()
}
// Create User Data
app.put("/users/:email", async (req, res) => {
  const user = req.body;
  const email = req.params.email;
  const filter = { email: email };
  const option = { upsert: true };
  const updateDoc = {
    $set: user,
  };
  const result = await Users.updateOne(filter, updateDoc, option);

  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "30d",
  });
  res.send({
    data: result,
    token: token,
    success: true,
    message: "Successfully Created User",
  });
});

// Get All User Data
app.get("/users", verifyJwt, verifyAdmin, async (req, res) => {
  try {
    const query = {};
    const result = await Users.find({}).toArray();
    res.send({
      data: result,
      success: true,
      message: "Successfully find the all data",
    });
  } catch (error) {
    res.send({
      data: error,
      success: true,
      message: "Data Load Fail",
    });
  }
});

// Filter data by user role 
app.get("/users/:role", async (req, res) => {
  try {
    const query = {};
    const userRole = req.params.role;
    const filter = {role: userRole}
    const result = await Users.find(filter).toArray();
    res.send({
      data: result,
      success: true,
      message: "Successfully find the all data",
    });
  } catch (error) {
    res.send({
      data: error,
      success: false,
      message: "Data Load Fail",
    });
  }
});

// Delete User
app.delete("/users/:id", verifyJwt, verifyAdmin, async (req, res)=>{
 try{
  const id = req.params.id;
  const filter = {_id: ObjectId(id)}
  const result = await Users.deleteOne(filter);
  res.send({
    data: result,
    success: true,
    message: "Successfully delete User",
  })
 }catch (error) {
    res.send({
      data: error,
      success: false,
      message: "Data Delete Fail",
    });
  }
})

// Create Category Data
app.post("/category", async (req, res) => {
  try {
    const category = req.body;
    const result = await Category.insertOne(category);
    res.send({
      data: result,
      success: true,
      message: "Category Created Successful",
    });
  } catch (error) {
    res.send({
      data: error,
      success: true,
      message: "Category Created Fail",
    });
  }
});

// Get All Category Data
app.get("/category", async (req, res) => {
  try {
    const query = {};
    const result = await Category.find({}).toArray();
    res.send({
      data: result,
      success: true,
      message: "Successfully find the all data",
    });
  } catch (error) {
    res.send({
      data: error,
      success: true,
      message: "Data Load Fail",
    });
  }
});

app.delete("/category/:id", verifyJwt, verifyAdmin, async (req, res)=>{
    const id = req.params.id;
    const filter = {_id: ObjectId(id)}
    const result = await Category.deleteOne(filter);
    res.send(result)
})

// Create Product Data
app.post("/products", async (req, res) => {
  try {
    const category = req.body;
    const result = await Products.insertOne(category);
    res.send({
      data: result,
      success: true,
      message: "Created Product Successful",
    });
  } catch (error) {
    res.send({
      data: error,
      success: true,
      message: "Category Created Fail",
    });
  }
});

// Get All Products Data
app.get("/products", async (req, res) => {
  try {
    const query = {};
    const result = await Products.find(query).toArray();
    res.send({
      data: result,
      success: true,
      message: "Successfully find the all Product data",
    });
  } catch (error) {
    res.send({
      data: error,
      success: true,
      message: "Data Load Fail",
    });
  }
});

// Delete Product
app.delete("/products/:id", verifyJwt, verifyAdmin, async (req, res)=>{
    const id = req.params.id;
    const filter = {_id: ObjectId(id)}
    const result = await Products.deleteOne(filter);
    res.send(result)
})

// Add New field by all product, If You Need Manually
app.put('/product/', async (req, res) => {
  const email = req.params.email
  const filter = {}
  const options = { upsert: true }
  const updateDoc = {
    $set: {
      years_of_use: 2
    }
  }
  const result = await Products.updateMany(filter, updateDoc, options);
 

  res.send({result})
})

// Create Blog Post Data
app.post("/blog", async (req, res) => {
  try {
    const blog = req.body;
    const result = await Blogs.insertOne(blog);
    res.send({
      data: result,
      success: true,
      message: "Blog Created Successful",
    });
  } catch (error) {
    res.send({
      data: error,
      success: true,
      message: "Blog Created Fail",
    });
  }
});

// Get All Blogs Data
app.get("/blog", async (req, res) => {
  try {
    const query = {};
    const result = await Blogs.find(query).toArray();
    res.send({
      data: result,
      success: true,
      message: "Successfully find the all Blogs data",
    });
  } catch (error) {
    res.send({
      data: error,
      success: true,
      message: "Data Load Fail",
    });
  }
});

// Find Blog Data By Id
app.get("/blog/:id", async (req, res) => {
  const id = req.params.id;
  console.log(id)
  const filter = { _id: ObjectId(id) };
  const result = await Blogs.find(filter).toArray();
  res.send({
    data: result,
    success: true,
    message: "Successfully Find the blog data",
  });
});

app.listen(process.env.PORT || 5000, () => {
  console.log("Server Running SuccessFull Port", process.env.PORT);
});
