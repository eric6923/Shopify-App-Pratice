document.addEventListener("DOMContentLoaded", function() {
  console.log("DOM loaded, checking for referral code");
  const params = new URLSearchParams(window.location.search);
  const referralCode = params.get("referralCode");
  
  console.log("Detected referral code:", referralCode);
  
  if (referralCode) {
    try {
      // Create popup with very basic styling that's hard to miss
      const modal = document.createElement("div");
      modal.id = "referral-popup";
      modal.style.position = "fixed";
      modal.style.top = "50%";
      modal.style.left = "50%";
      modal.style.transform = "translate(-50%, -50%)";
      modal.style.backgroundColor = "white";
      modal.style.padding = "20px";
      modal.style.borderRadius = "10px";
      modal.style.boxShadow = "0px 4px 6px rgba(0,0,0,0.2)";
      modal.style.zIndex = "10000";
      modal.style.width = "300px";
      modal.style.textAlign = "center";
      
      modal.innerHTML = `
        <h2 style="margin-top: 20px;">Enter Your Email</h2>
        <p>Referral Code: <strong>${referralCode}</strong></p>
        <button id="close-popup" style="position: absolute; top: 5px; right: 5px; 
            background: transparent; border: none; font-size: 20px; font-weight: bold;
            cursor: pointer; color: black;">
            &times;
        </button>
        <input type="email" id="email" placeholder="Enter your email" 
            style="width: 90%; padding: 10px; margin-top: 10px; border: 1px solid #ccc; border-radius: 5px;">
        <button id="submit-referral" style="margin-top: 10px; padding: 10px 20px; 
            background: black; color: white; border: none; cursor: pointer; border-radius: 5px;">
            Submit
        </button>
      `;
      
      console.log("About to append popup to body");
      document.body.appendChild(modal);
      console.log("Popup appended to body");
      
      // Add event listeners
      document.getElementById("close-popup").addEventListener("click", function() {
        console.log("Close button clicked");
        document.getElementById("referral-popup").remove();
      });
      
      document.getElementById("submit-referral").addEventListener("click", function() {
        console.log("Submit button clicked");
        const email = document.getElementById("email").value;
        if (email) {
          fetch("/apps/main", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ referralCode, email })
          })
          .then(res => res.json())
          .then(data => {
            console.log("Server Response:", data);
            if (data.success) {
              alert("Referral Applied Successfully!");
              document.getElementById("referral-popup").remove();
            } else {
              alert("Error: " + data.message);
            }
          })
          .catch(error => {
            console.error("Error:", error);
            alert("An error occurred while processing your request.");
          });
        } else {
          alert("Please enter a valid email.");
        }
      });
    } catch (error) {
      console.error("Error creating popup:", error);
    }
  }
});