document.addEventListener("DOMContentLoaded", async function () {
  const params = new URLSearchParams(window.location.search);
  const referralCode = params.get("referralCode");

  if (referralCode) {
    const response = await fetch(`/apps/main?code=${referralCode}`);
    const data = await response.json();

    if (data.valid) {
      console.log("Valid referral code:", referralCode);

      const modal = document.createElement("div");
      modal.id = "referral-popup";
      modal.innerHTML = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: white; padding: 20px; border-radius: 10px; box-shadow: 0px 4px 6px rgba(0,0,0,0.2);
            z-index: 10000; text-align: center; width: 300px; position: relative;">

            <!-- Close Button -->
            <button id="close-popup" style="position: absolute; top: 5px; right: 5px; 
                background: transparent; border: none; font-size: 20px; font-weight: bold;
                cursor: pointer; color: black;">
                &times;
            </button>

            <h2 style="margin-top: 20px;">Enter Your Email</h2>
            <p>Referral Code: <strong>${referralCode}</strong></p>
            <input type="email" id="email" placeholder="Enter your email" 
                style="width: 100%; padding: 10px; margin-top: 10px; border: 1px solid #ccc; border-radius: 5px;">
            <button id="submit-referral" style="margin-top: 10px; padding: 10px 20px; 
                background: black; color: white; border: none; cursor: pointer; border-radius: 5px;">
                Submit
            </button>
        </div>
      `;

      document.body.appendChild(modal);

      document.getElementById("close-popup").addEventListener("click", function () {
        document.getElementById("referral-popup").remove();
      });
    } else {
      console.error("Invalid referral code");
    }
  }
});
