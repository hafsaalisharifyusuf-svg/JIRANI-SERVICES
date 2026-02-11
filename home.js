const API_URL = "http://localhost:3000";

/* ================================
   LOAD WORKERS PAGE
================================ */
if (document.getElementById("workersContainer")) {

    fetch(`${API_URL}/workers`)
        .then(res => res.json())
        .then(workers => {
            const container = document.getElementById("workersContainer");
            container.innerHTML = "";

            workers.forEach(worker => {
                const card = document.createElement("div");
                card.classList.add("worker-card");

                card.innerHTML = `
                    <img src="${worker.image}" alt="${worker.name}">
                    <div class="worker-info">
                        <h3>${worker.name}</h3>
                        <p>${worker.profession}</p>
                        <span class="rating">${worker.rating}</span>
                    </div>
                `;

                container.appendChild(card);
            });
        })
        .catch(err => console.log(err));
}

/* ================================
   LOAD WORKERS INTO BOOKING DROPDOWN
================================ */
if (document.getElementById("workerSelect")) {

    fetch(`${API_URL}/workers`)
        .then(res => res.json())
        .then(workers => {
            const select = document.getElementById("workerSelect");

            workers.forEach(worker => {
                const option = document.createElement("option");
                option.value = worker.id;
                option.textContent = `${worker.name} - ${worker.profession}`;
                select.appendChild(option);
            });
        });
}

/* ================================
   CREATE BOOKING
================================ */
if (document.getElementById("bookingForm")) {

    document.getElementById("bookingForm").addEventListener("submit", function (e) {
        e.preventDefault();

        const customerName = document.getElementById("customerName").value;
        const contactNumber = document.getElementById("contactNumber").value;
        const workerId = parseInt(document.getElementById("workerSelect").value);
        const serviceDate = document.getElementById("serviceDate").value;

        fetch(`${API_URL}/workers/${workerId}`)
            .then(res => res.json())
            .then(worker => {

                const newBooking = {
                    customerName,
                    contactNumber,
                    workerId: worker.id,
                    workerName: worker.name,
                    serviceDate,
                    status: "Pending"
                };

                return fetch(`${API_URL}/bookings`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newBooking)
                });
            })
            .then(() => {
                alert("Booking created successfully!");
                document.getElementById("bookingForm").reset();
            })
            .catch(err => console.log(err));
    });
}

/* ================================
   LOAD ADMIN DASHBOARD
================================ */
if (document.getElementById("bookingsTableBody")) {

    loadBookings();

    function loadBookings() {
        fetch(`${API_URL}/bookings`)
            .then(res => res.json())
            .then(bookings => {

                const tableBody = document.getElementById("bookingsTableBody");
                tableBody.innerHTML = "";

                let pending = 0;
                let approved = 0;
                let rejected = 0;

                bookings.forEach(booking => {

                    if (booking.status === "Pending") pending++;
                    if (booking.status === "Approved") approved++;
                    if (booking.status === "Rejected") rejected++;

                    const row = document.createElement("tr");

                    row.innerHTML = `
                        <td>${booking.customerName}</td>
                        <td>${booking.workerName}</td>
                        <td>${booking.serviceDate}</td>
                        <td>
                            <span class="status-badge ${booking.status.toLowerCase()}">
                                ${booking.status}
                            </span>
                        </td>
                        <td>
                            <button onclick="updateStatus(${booking.id}, 'Approved')" class="approve-btn">Approve</button>
                            <button onclick="updateStatus(${booking.id}, 'Rejected')" class="reject-btn">Reject</button>
                            <button onclick="deleteBooking(${booking.id})" class="delete-btn">Delete</button>
                        </td>
                    `;

                    tableBody.appendChild(row);
                });

                document.getElementById("totalBookings").textContent = bookings.length;
                document.getElementById("pendingCount").textContent = pending;
                document.getElementById("approvedCount").textContent = approved;
                document.getElementById("rejectedCount").textContent = rejected;
            });
    }

    window.updateStatus = function (id, newStatus) {
        fetch(`${API_URL}/bookings/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus })
        })
            .then(() => loadBookings());
    };

    window.deleteBooking = function (id) {
        fetch(`${API_URL}/bookings/${id}`, {
            method: "DELETE"
        })
            .then(() => loadBookings());
    };
}
