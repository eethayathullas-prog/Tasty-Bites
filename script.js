// ---------- Food data ----------
var foods = [
    { id: 1, name: "Margherita Pizza", category: "Pizza", price: 249, image: "images/margherita-pizza.jpg" },
    { id: 2, name: "Pepperoni Pizza", category: "Pizza", price: 329, image: "images/pepperoni-pizza.jpg" },
    { id: 3, name: "Veg Burger", category: "Burgers", price: 129, image: "images/veg-burger.jpg" },
    { id: 4, name: "Chicken Burger", category: "Burgers", price: 169, image: "images/chicken-burger.jpg" },
    { id: 5, name: "Chicken Biryani", category: "Rice", price: 220, image: "images/chicken-biryani.jpg" },
    { id: 6, name: "Veg Fried Rice", category: "Rice", price: 150, image: "images/veg-fried-rice.jpg" },
    { id: 7, name: "Paneer Wrap", category: "Snacks", price: 120, image: "images/paneer-wrap.jpg" },
    { id: 8, name: "French Fries", category: "Snacks", price: 90, image: "images/french-fries.jpg" },
    { id: 9, name: "Ice Cream", category: "Desserts", price: 80, image: "images/ice-cream.jpg" },
    { id: 10, name: "Gulab Jamun", category: "Desserts", price: 70, image: "images/gulab-jamun.jpg" },
    { id: 11, name: "Cold Coffee", category: "Drinks", price: 100, image: "images/cold-coffee.jpg" },
    { id: 12, name: "Lime Soda", category: "Drinks", price: 60, image: "images/lime-soda.jpg" }
];

var cart = [];                 // items added by the user
var selectedCategory = "All";  // current category


// ---------- Page switching ----------
function showPage(pageName) {
    var pages = ["loginPage", "appPage", "paymentPage", "historyPage"];
    for (var i = 0; i < pages.length; i++) {
        if (pages[i] == pageName) {
            document.getElementById(pages[i]).style.display = "block";
        } else {
            document.getElementById(pages[i]).style.display = "none";
        }
    }
}

function goHome() {
    showPage("appPage");
}


// ---------- Local storage helpers ----------
// localStorage keeps data in the browser, even after refresh
function getUsers() {
    var data = localStorage.getItem("users");
    if (data == null) {
        return [];
    }
    return JSON.parse(data);
}

function getOrders() {
    var data = localStorage.getItem("orders");
    if (data == null) {
        return [];
    }
    return JSON.parse(data);
}

function findUser(email) {
    var users = getUsers();
    for (var i = 0; i < users.length; i++) {
        if (users[i].email == email) {
            return users[i];
        }
    }
    return null;
}


// ---------- Login and Register ----------
function showRegister() {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("registerBox").style.display = "block";
}

function showLogin() {
    document.getElementById("registerBox").style.display = "none";
    document.getElementById("loginBox").style.display = "block";
}

function registerUser() {
    var name = document.getElementById("regName").value.trim();
    var email = document.getElementById("regEmail").value.trim().toLowerCase();
    var password = document.getElementById("regPassword").value;
    var error = document.getElementById("regError");

    if (name == "" || email == "" || password == "") {
        error.innerText = "Please fill all the fields";
        return;
    }
    if (email.indexOf("@") == -1) {
        error.innerText = "Enter a valid email";
        return;
    }
    if (password.length < 4) {
        error.innerText = "Password must have at least 4 characters";
        return;
    }
    if (findUser(email) != null) {
        error.innerText = "This email is already registered";
        return;
    }

    var users = getUsers();
    users.push({ name: name, email: email, password: password });
    localStorage.setItem("users", JSON.stringify(users));

    error.innerText = "";
    alert("Registration successful! Please login.");
    showLogin();
}

function loginUser() {
    var email = document.getElementById("loginEmail").value.trim().toLowerCase();
    var password = document.getElementById("loginPassword").value;
    var error = document.getElementById("loginError");

    var user = findUser(email);
    if (user == null || user.password != password) {
        error.innerText = "Wrong email or password";
        return;
    }

    error.innerText = "";
    localStorage.setItem("currentUser", email);
    startApp();
}

function logout() {
    localStorage.removeItem("currentUser");
    cart = [];
    updateCart();
    document.getElementById("loginPassword").value = "";
    showPage("loginPage");
}

function startApp() {
    var email = localStorage.getItem("currentUser");
    var user = findUser(email);
    document.getElementById("welcome").innerText = "Hi, " + user.name;
    showPage("appPage");
    showMenu();
    updateCart();
}


// ---------- Show food items ----------
function showMenu() {
    var menuDiv = document.getElementById("menu");
    var searchText = document.getElementById("searchBox").value.toLowerCase();
    var output = "";

    for (var i = 0; i < foods.length; i++) {
        var f = foods[i];

        // check category and search text
        var categoryOk = (selectedCategory == "All" || f.category == selectedCategory);
        var searchOk = f.name.toLowerCase().indexOf(searchText) != -1;

        if (categoryOk && searchOk) {
            output += '<div class="food-card">';
            output += '<img src="' + f.image + '" alt="' + f.name + '">';
            output += '<h4>' + f.name + '</h4>';
            output += '<p>Rs ' + f.price + '</p>';
            output += '<button onclick="addToCart(' + f.id + ')">Add</button>';
            output += '</div>';
        }
    }

    if (output == "") {
        output = "<p>No food found</p>";
    }
    menuDiv.innerHTML = output;
}

function filterCategory(cat) {
    selectedCategory = cat;
    showMenu();
}


// ---------- Cart functions ----------
function addToCart(id) {
    // if item is already in cart, increase quantity
    for (var i = 0; i < cart.length; i++) {
        if (cart[i].id == id) {
            cart[i].qty++;
            updateCart();
            return;
        }
    }
    cart.push({ id: id, qty: 1 });
    updateCart();
}

function changeQty(id, change) {
    for (var i = 0; i < cart.length; i++) {
        if (cart[i].id == id) {
            cart[i].qty = cart[i].qty + change;
            if (cart[i].qty <= 0) {
                cart.splice(i, 1);   // remove item
            }
            break;
        }
    }
    updateCart();
}

function getFood(id) {
    for (var i = 0; i < foods.length; i++) {
        if (foods[i].id == id) {
            return foods[i];
        }
    }
}

// calculate subtotal, gst, delivery and total
function calculateBill() {
    var subtotal = 0;
    var items = 0;

    for (var i = 0; i < cart.length; i++) {
        var food = getFood(cart[i].id);
        subtotal = subtotal + food.price * cart[i].qty;
        items = items + cart[i].qty;
    }

    var gst = subtotal * 0.05;
    var delivery = 0;
    if (subtotal > 0) {
        delivery = 30;
    }
    var total = subtotal + gst + delivery;

    return { subtotal: subtotal, gst: gst, delivery: delivery, total: total, items: items };
}

function updateCart() {
    var output = "";

    for (var i = 0; i < cart.length; i++) {
        var food = getFood(cart[i].id);
        var amount = food.price * cart[i].qty;

        output += '<div class="cart-item">' + food.name + ' - Rs ' + amount + '<br>';
        output += '<button onclick="changeQty(' + food.id + ', -1)">-</button>';
        output += cart[i].qty;
        output += '<button onclick="changeQty(' + food.id + ', 1)">+</button></div>';
    }

    if (cart.length == 0) {
        output = "<p>Cart is empty</p>";
    }

    var bill = calculateBill();
    document.getElementById("cartItems").innerHTML = output;
    document.getElementById("subtotal").innerText = bill.subtotal;
    document.getElementById("gst").innerText = bill.gst.toFixed(2);
    document.getElementById("delivery").innerText = bill.delivery;
    document.getElementById("total").innerText = bill.total.toFixed(2);
    document.getElementById("cartCount").innerText = bill.items;
}

function openCart() {
    document.getElementById("cartBox").style.display = "block";
}

function closeCart() {
    document.getElementById("cartBox").style.display = "none";
}


// ---------- Payment ----------
function openPayment() {
    if (cart.length == 0) {
        alert("Please add some food first!");
        return;
    }
    closeCart();

    // show order summary
    var summary = "";
    for (var i = 0; i < cart.length; i++) {
        var food = getFood(cart[i].id);
        summary += '<div class="summary-line"><span>' + food.name + ' x ' + cart[i].qty + '</span>';
        summary += '<span>Rs ' + (food.price * cart[i].qty) + '</span></div>';
    }
    var bill = calculateBill();
    summary += '<div class="summary-line"><span>GST (5%)</span><span>Rs ' + bill.gst.toFixed(2) + '</span></div>';
    summary += '<div class="summary-line"><span>Delivery</span><span>Rs ' + bill.delivery + '</span></div>';
    summary += '<h4>Total: Rs ' + bill.total.toFixed(2) + '</h4>';
    document.getElementById("orderSummary").innerHTML = summary;

    // reset the form
    document.getElementById("payForm").style.display = "block";
    document.getElementById("paySuccess").style.display = "none";
    document.getElementById("payError").innerText = "";
    document.getElementById("address").value = "";
    document.getElementById("payMethod").value = "Cash on Delivery";
    changeMethod();

    showPage("paymentPage");
}

// show card or upi boxes based on selected method
function changeMethod() {
    var method = document.getElementById("payMethod").value;
    document.getElementById("upiBox").style.display = (method == "UPI") ? "block" : "none";
    document.getElementById("cardBox").style.display = (method == "Card") ? "block" : "none";
}

function payNow() {
    var address = document.getElementById("address").value.trim();
    var method = document.getElementById("payMethod").value;
    var error = document.getElementById("payError");

    // validation
    if (address == "") {
        error.innerText = "Please enter delivery address";
        return;
    }
    if (method == "UPI") {
        var upi = document.getElementById("upiId").value.trim();
        if (upi.indexOf("@") == -1) {
            error.innerText = "Enter a valid UPI ID";
            return;
        }
    }
    if (method == "Card") {
        var cardNo = document.getElementById("cardNumber").value.trim();
        var cardName = document.getElementById("cardName").value.trim();
        var expiry = document.getElementById("cardExpiry").value.trim();
        var cvv = document.getElementById("cardCvv").value.trim();

        if (cardNo.length != 16 || isNaN(cardNo)) {
            error.innerText = "Card number must be 16 digits";
            return;
        }
        if (cardName == "" || expiry.length != 5 || cvv.length != 3 || isNaN(cvv)) {
            error.innerText = "Please check card name, expiry and CVV";
            return;
        }
    }
    error.innerText = "";

    // make the order
    var bill = calculateBill();
    var orderItems = [];
    for (var i = 0; i < cart.length; i++) {
        var food = getFood(cart[i].id);
        orderItems.push({ name: food.name, qty: cart[i].qty, price: food.price });
    }

    var orderId = Math.floor(Math.random() * 900000) + 100000;
    var order = {
        id: orderId,
        email: localStorage.getItem("currentUser"),
        date: new Date().toLocaleString(),
        items: orderItems,
        total: bill.total.toFixed(2),
        method: method,
        address: address
    };

    // save the order
    var orders = getOrders();
    orders.push(order);
    localStorage.setItem("orders", JSON.stringify(orders));

    // clear cart and show success message
    cart = [];
    updateCart();
    document.getElementById("successMsg").innerText =
        "Order ID: " + orderId + " | Total: Rs " + order.total + " | Payment: " + method;
    document.getElementById("payForm").style.display = "none";
    document.getElementById("paySuccess").style.display = "block";
}


// ---------- Order history ----------
function showHistory() {
    var email = localStorage.getItem("currentUser");
    var orders = getOrders();
    var output = "";

    // show latest order first
    for (var i = orders.length - 1; i >= 0; i--) {
        if (orders[i].email == email) {
            var o = orders[i];
            output += '<div class="order-card">';
            output += '<b>Order #' + o.id + '</b> - ' + o.date + '<br>';
            for (var j = 0; j < o.items.length; j++) {
                output += o.items[j].name + ' x ' + o.items[j].qty + '<br>';
            }
            output += 'Total: Rs ' + o.total + '<br>';
            output += 'Payment: ' + o.method + '<br>';
            output += 'Address: ' + o.address;
            output += '</div>';
        }
    }

    if (output == "") {
        output = '<p style="margin:20px">No orders yet</p>';
    }
    document.getElementById("historyList").innerHTML = output;
    showPage("historyPage");
}


// ---------- Run when page loads ----------
document.getElementById("searchBox").onkeyup = showMenu;

// if user is already logged in, go to food page, else show login page
var savedUser = localStorage.getItem("currentUser");
if (savedUser != null && findUser(savedUser) != null) {
    startApp();
} else {
    showPage("loginPage");
}
