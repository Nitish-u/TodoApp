// kal hame multiply database ko connect krna sikhna hai.

const port = 1000;
const url1 = "mongodb://127.0.0.1:27017/TodoMembers";
const url2 = "mongodb://127.0.0.1:27017/TodoData";
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
import mongoose from "mongoose";
import Jwt from "jsonwebtoken";
import Express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

const secretkey = "This-is-the-secret-key-for-todo-app";

// Connecting databases:-
const db1 = mongoose.createConnection(url1, options);
const db2 = mongoose.createConnection(url2, options);

// Creating schema for the user data to be stored in mongodb
const userDataSchema = new mongoose.Schema({
  Name: String,
  Email: String,
  Password: String,
});

// Creating schema for the user's todo data to be stored in mongodb
const todoDataSchema = new mongoose.Schema({
  Email: String,
  DATA: Array,
});

// Creating model for the todo member
const user = db1.model("user", userDataSchema);

// Creating model for the todo member's data
const todo = db2.model("todo", todoDataSchema);

const app = Express();
app.set("view engine", "ejs");
app.use(Express.static("Public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(Express.json());

// Get requests:-
app.get("/", (req, res) => {
  // This will render the login page.
  res.render("./login");
});

app.get("/reg", (req, res) => {
  // This will render the registration page.
  res.render("./reg");
});

app.get("/Home", async (req, res) => {
  // Check/get the cookie.
  const userToken = req.cookies.token;
  // Verify the jwt token.
  Jwt.verify(userToken, secretkey, (err, decoded) => {
    if (err) {
      // error handlying when the varification fails redirect to login page.
      console.error("Token verification failed(line num : 66):", err.message);
      res.redirect("/");
    } else {
      // Token verification succeeded, 'decoded' will contain the payload (claims) of the token
      // Serching for user from the payload we decoded.
      user.findById(decoded.userid).then((userDetails) => {
        // Extracting name and email form the user we found.
        const userName = userDetails.Name;
        // This will render the Home page.
        res.render("./HomePage",{pic : userName.toUpperCase().trim()});
      });
    }
  });
});

app.get("/logout", (req, res) => {
  // This endpoint will clear all the cookies by their names
  const cookies = Object.keys(req.cookies);
  // Extracted all the cookies
  cookies.forEach((cookieName) => {
    res.clearCookie(cookieName);
  });
  res.redirect("/Home");
});

app.get("/getTodoData", async (req, res) => {
  const user = await varification(req.cookies.token);
  if (user) {
    const data = await todo
      .findOne({ Email: user.E_mail })
      .then((userData) => {
        if (userData) {
          if (userData.DATA) {
            return userData.DATA;
          }
        }
      })
      .catch((error) => {
        console.log(`user not found`, error);
      });
    res.json({ usersTodoData: data });
  }
});



// Post Requests:-

// on login page:-
app.post("/", (req, res) => {
  // extrcting the req body text/data which is being sent by the client.
  const { Email, Password } = req.body;
  // finding user so using email so that we can verify the password.
  const findUser = user
    .findOne({ Email })
    .then((userDetails) => {
      // If the user is present then go in.
      if (userDetails) {
        // if the passwords match then go in.
        if (userDetails.Password == Password) {
          // creating jwt token using the id of the matched data we retrived from the database.
          const token = Jwt.sign({ userid: userDetails._id }, secretkey);
          // Sending the token via cookie.
          res.cookie("token", token, {
            httpOnly: true, // so it will not be accessed by client side js.
          });
          // redirecting to home endpoint
          res.redirect("/Home");
        } else {
          // throwing error when password is wrong.
          throw new Error("Invalid Username or Passsword!");
        }
      } else {
        // throwing error when user not found.
        throw new Error("User not Found!");
      }
    })
    .catch((e) => {
      // extracting the message from the error object.
      const msg = e.message;
      // Sending this error msg via cookie so that the client side js use this msg to render an alert msg.
      res.cookie("Msg", msg, {
        maxAge: 6000, // setting the age of the cookie. This cookies will automatically be deleted after 6s.
      });
      // redirecting to login page.
      res.redirect("/");
    });
});

// on registration page:-
app.post("/reg", async (req, res) => {
  // Destructuring parsed body data.
  const { Name, Email, setPassword } = await req.body;
  // Get the token id for the created user.
  const checkingUser = user
    .find({ Email })
    // checking if any user with same email exists or not, if exist then it will redirect to the login page and at the same time it will show a pop-up that user already exists and if there is no user with the same email then it will create a new token for the registerd user and set it as cookies so that it gets varified at the home page and the registerd user able to use the app.
    .then(async (userDetails) => {
      // going in when user found.
      if (userDetails[0] != undefined) {
        // throwing error when user is found.
        throw new Error(`User alredy Exist!`);
      } else {
        // creating user.
        const tokenId = await user.create({
          Name,
          Email,
          Password: setPassword,
        });
        // Creating jwt for the id of of the created user.
        const token = Jwt.sign({ userid: tokenId._id }, secretkey);
        // Setting cookies for the new user.
        res.cookie("token", token, {
          httpOnly: true,
        });
        // Redirect cliet request to home endpoint.
        res.redirect("/Home");
      }
    })
    .catch((Error) => {
      // extracting the message from the error object.
      const msg = Error.message;
      // Sending this error msg via cookie so that the client side js use this msg to render an alert msg.
      res.cookie("Msg", msg, {
        maxAge: 6000,
      });
      // redirecting to login page.
      res.redirect("/");
    });
});

app.post("/syncData", async (req, res) => {
  // This port will help in syncing the data to database.
  const data = req.body;
  res.send({ message: "we got it" });
  // Check/get the cookie.
  const userToken = req.cookies.token;
  // verifying user.
  const obj = await varification(userToken);
  if (obj) {
    const email = obj.E_mail;
    todo
      .find({ Email: email })
      // finding user by email.
      .then(async (res) => {
        // checking if there is any user with this email.``
        if (res[0]) {
          if (res[0].id) {
            // getting the id to use it for finding and updating the data.
            const updatedData = await todo.findByIdAndUpdate(
              res[0].id,
              { DATA: data },
              { new: true }
            );
            // updated the data property of the existing object.
          }
        } else {
          // this block will work when no user found with same email.
          if (email !== undefined && email !== null) {
            // this will create a new data for the member.
            todo.create({ Email: email, DATA: data });
          } else {
            console.log(`email not found : `, email);
            // when emial is not found this will be loged on the console.
          }
        }
      })
      .catch((error) => {
        console.log(`Some error occured : `, error);
        // catch any error occured while handling the promise.
      });
  }
});

async function varification(userToken) {
  // Verify the jwt token.
  const decoded = Jwt.verify(userToken, secretkey, (err, decoded) => {
    if (err) {
      // error handlying when the varification fails redirect to login page.
      console.error("Token verification failed(line num:253):", err.message);
    } else {
      // Token verification succeeded, 'decoded' will contain the payload (claims) of the token
      // Serching for user from the payload we decoded.
      return decoded.userid;
    }
  });
  return await findingById(decoded);
}

async function findingById(id) {
  let email;
  let UserID;
  await user.findById(id).then((userDetails) => {
    // Extracting id form the user we found.
    if (userDetails) {
      email = userDetails.Email;
      UserID = userDetails.id;
    }
  });
  if (email !== undefined && email !== null) {
    return { E_mail: email, objId: UserID };
  }
}

// Opening/listening
app.listen(port, "0.0.0.0", () => {
  console.log(`Sever is listening on localhost ${port}`);
});
