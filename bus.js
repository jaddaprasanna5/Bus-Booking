console.log("CityRide JS Loaded");

// Getting all required HTML elements
const fromCity = document.getElementById("fromCity");
const toCity = document.getElementById("toCity");
const travelDate = document.getElementById("travelDate");
const searchBtn = document.getElementById("searchBtn");
const errorMessage = document.getElementById("errorMessage");
const busResults = document.getElementById("busResults");
const exploreBtn = document.getElementById("exploreBtn");
const bookingDetails = document.getElementById("bookingDetails");
const passengerSelect = document.getElementById("passengers");
const loginBtn = document.getElementById("loginBtn");
const loginModal = document.getElementById("loginModal");
const closeModal = document.getElementById("closeModal");
const submitLogin = document.getElementById("submitLogin");

// Passenger form elements - NEW
const passengerFormContainer = document.getElementById("passengerFormContainer");
const passengerFields = document.getElementById("passengerFields");
const passengerForm = document.getElementById("passengerForm");
const passengerError = document.getElementById("passengerError");
const finalTotal = document.getElementById("finalTotal");

// Setting today's date as the minimum travel date
const today = new Date().toISOString().split('T')[0];
travelDate.setAttribute("min", today);

// Moving to the search section when Explore Buses is clicked
exploreBtn.addEventListener("click", () => {
    document.getElementById("search").scrollIntoView({ behavior: "smooth" });
});

// Opening login or logging out
loginBtn.addEventListener("click", () => {
    if(localStorage.getItem("isLoggedIn") === "true"){
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userId");
        loginBtn.textContent = "Login";
        alert("Logged out successfully!");
        return;
    }
    loginModal.style.display = "flex";
});

// Closing the login popup
closeModal.addEventListener("click", () => {
    loginModal.style.display = "none";
    document.getElementById("loginError").textContent = "";
});

// Checking login details
submitLogin.addEventListener("click", () => {
    const id = document.getElementById("loginId").value.trim();
    const pass = document.getElementById("loginPassword").value.trim();
    const error = document.getElementById("loginError");
    if(id === "" || pass === ""){
        error.textContent = "Please enter ID and Password";
        return;
    }
    if(id === "admin" && pass === "1234"){
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userId", id);
        loginModal.style.display = "none";
        loginBtn.textContent = `Hi, ${id} | Logout`;
        alert(`Welcome ${id}! Login Successful`);
        document.getElementById("loginId").value = "";
        document.getElementById("loginPassword").value = "";
        error.textContent = "";
    } else {
        error.textContent = "Invalid ID or Password! Try admin / 1234";
    }
});

// Loading previous login and booking
window.addEventListener("load", () => {
    if(localStorage.getItem("isLoggedIn") === "true"){
        const id = localStorage.getItem("userId");
        loginBtn.textContent = `Hi, ${id} | Logout`;
    }
    const saved = localStorage.getItem("myBooking");
    if(saved){
        const data = JSON.parse(saved);
        let passengerInfo = "";
        if(data.passengerDetails){
            passengerInfo = data.passengerDetails.map((p,i)=> `<p>${i+1}. ${p.name} (${p.age}y, ${p.gender})</p>`).join("");
        }
        bookingDetails.innerHTML = `
            <div class="booking-card">
                <h3>✅ Last Saved Booking</h3>
                <p><b>Bus:</b> ${data.bus}</p>
                <p><b>Route:</b> ${data.route}</p>
                <p><b>Date:</b> ${data.date}</p>
                <p><b>Passengers:</b> ${data.passengers}</p>
                ${passengerInfo}
                <h3 style="color: #4a5af6;">Total: ₹${data.total}</h3>
                <button onclick="clearBooking()" style="padding:10px; background:red; color:white; border:none; border-radius:6px; margin-top:10px; cursor:pointer;">Clear Booking</button>
            </div>
        `;
    }
});

let buses = [];
let selectedBooking = null;

async function loadBuses(){
    try {
        busResults.innerHTML = "<p>Loading buses from API... ⏳</p>";
        const response = await fetch("./city-ride.json");
        if (!response.ok) throw new Error("buses.json not found! Use Live Server");
        const data = await response.json();
        buses = data;
        busResults.innerHTML = "";
    } catch (error) {
        busResults.innerHTML = `<p style="color:red;">❌ ${error.message}</p>`;
        errorMessage.textContent = "Please run with Live Server";
    }
}
loadBuses();

searchBtn.addEventListener("click", async(e) => {
    e.preventDefault();
    if (buses.length === 0) {
        await loadBuses();
        if (buses.length === 0) return;
    }
    const from = fromCity.value;
    const to = toCity.value;
    const date = travelDate.value;
    errorMessage.textContent = "";
    busResults.innerHTML = "";
    if (from === "") { errorMessage.textContent = "Please Select a Departure City"; return; }
    if (to === "") { errorMessage.textContent = "Please Select a Destination City"; return; }
    if (date === "") { errorMessage.textContent = "Please Select Travel Date"; return; }
    if (from === to) { errorMessage.textContent = "Departure and Destination cannot be the same."; return; }
    const filteredBuses = buses.filter(bus => bus.from === from && bus.to === to);
    if(filteredBuses.length === 0){
        busResults.innerHTML = `<p>No buses found from ${from} to ${to}</p>`;
        return;
    }
    filteredBuses.forEach(bus => {
        const div = document.createElement("div");
        div.className = "bus-card";
        div.innerHTML = `
        <h3>${bus.name}</h3>
        <p>${bus.from} → ${bus.to} | Time: ${bus.time} | ${bus.duration}</p>
        <p>Price: ₹${bus.price} | Seats: ${bus.seats}</p>
        <button onclick="bookBus(${bus.id})">Book Now</button>
        `;
        busResults.appendChild(div);
    });
});

// === UPDATED BOOKING LOGIC ===
function bookBus(id){
    const bus = buses.find(b => b.id === id);
    selectedBooking = bus;
    const count = parseInt(passengerSelect.value);
    const total = bus.price * count;
    const date = travelDate.value;
    passengerFormContainer.style.display = "none";

    bookingDetails.innerHTML = `
        <div class="booking-card">
            <h3>🚌 ${bus.name}</h3>
            <p><b>Route:</b> ${bus.from} → ${bus.to}</p>
            <p><b>Date:</b> ${date}</p>
            <p><b>Time:</b> ${bus.time} | ${bus.duration}</p>
            <p><b>Passengers:</b> ${count}</p>
            <hr style="margin: 15px 0;">
            <h3 style="color: #4a5af6;">Total: ₹${total}</h3>
            <button class="confirm-btn" onclick="showPassengerForm()">Enter Passenger Details →</button>
        </div>
    `;
    document.getElementById("booking").scrollIntoView({behavior: "smooth"});
}

function showPassengerForm(){
    if(!selectedBooking) return;
    const count = parseInt(passengerSelect.value);
    const total = selectedBooking.price * count;
    finalTotal.textContent = total;
    passengerFields.innerHTML = "";
    passengerError.textContent = "";
    for(let i = 1; i <= count; i++){
        passengerFields.innerHTML += `
            <div class="passenger-block">
                <h4>Passenger ${i}</h4>
                <div class="row">
                    <input type="text" placeholder="Full Name" class="p-name" required>
                    <input type="number" placeholder="Age" class="p-age" min="1" max="100" required>
                    <select class="p-gender" required>
                        <option value="">Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>
        `;
    }
    passengerFormContainer.style.display = "block";
    passengerFormContainer.scrollIntoView({behavior: "smooth"});
}

passengerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const names = document.querySelectorAll(".p-name");
    const ages = document.querySelectorAll(".p-age");
    const genders = document.querySelectorAll(".p-gender");
    let passengersList = [];
    for(let i = 0; i < names.length; i++){
        const name = names[i].value.trim();
        const age = ages[i].value.trim();
        const gender = genders[i].value;
        if(name === "" || age === "" || gender === ""){
            passengerError.textContent = `Please fill all details for Passenger ${i+1}`;
            return;
        }
        if(name.length < 3){
            passengerError.textContent = `Name too short for Passenger ${i+1}`;
            return;
        }
        passengersList.push({ name, age, gender });
    }
    const count = passengersList.length;
    const total = selectedBooking.price * count;
    const date = travelDate.value;
    const bookingData = {
        bus: selectedBooking.name,
        route: `${selectedBooking.from} → ${selectedBooking.to}`,
        date: date,
        passengers: count,
        total: total,
        passengerDetails: passengersList
    };
    localStorage.setItem("myBooking", JSON.stringify(bookingData));
    passengerFormContainer.style.display = "none";
    bookingDetails.innerHTML += `<p style="color:green; font-weight:bold; margin-top:15px;">✅ Booking Saved! Details saved in localStorage.</p>`;
    alert(`Booking Confirmed!\nBus: ${selectedBooking.name}\nPassengers: ${passengersList.map(p=>p.name).join(", ")}\nTotal: ₹${total}\n\nHappy Journey! 🚌`);
});

function fillTrip(from, to){
    fromCity.value = from;
    toCity.value = to;
    if(travelDate.value === ""){ travelDate.value = today; }
    document.getElementById("search").scrollIntoView({behavior: "smooth"});
    setTimeout(() => { searchBtn.click(); }, 500);
}

function clearBooking(){
    localStorage.removeItem("myBooking");
    bookingDetails.innerHTML = `<p class="no-booking">No booking yet. Search and book a bus to see details here.</p>`;
    passengerFormContainer.style.display = "none";
    alert("Booking removed from localStorage!");
}