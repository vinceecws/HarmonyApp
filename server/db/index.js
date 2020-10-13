const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://vincey:vincey123@harmonycluster.itr8g.mongodb.net/HarmonyApp?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });
const item = {
  name: "Tetra",
  age: "2000"
}


client.connect(err => {
  const collection = client.db("HarmonyApp").collection("users");
  collection.insertOne(item).then(result=>console.log(`Successfully added ${result}`)).catch(result=>console.log(`Failed to add ${result}`));

  collection.findOne({name:"Tetra"}).then(result=>console.log(`Successfully found ${result}`)).catch(result=>console.log(`Failed to find ${result}`));

  client.close();
});

