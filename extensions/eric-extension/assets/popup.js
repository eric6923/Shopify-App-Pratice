document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded, checking for referral code");
  const params = new URLSearchParams(window.location.search);
  const referralCode = params.get("referralCode");

  console.log("Detected referral code:", referralCode);

  if (referralCode) {
    try {
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
        <div id="discount-info" style="display: none; margin-top: 15px; padding: 10px; background-color: #f8f8f8; border-radius: 5px;">
        </div>
      `;

      console.log("About to append popup to body");
      document.body.appendChild(modal);
      console.log("Popup appended to body");

      document
        .getElementById("close-popup")
        .addEventListener("click", function () {
          console.log("Close button clicked");
          document.getElementById("referral-popup").remove();
        });

      document
        .getElementById("submit-referral")
        .addEventListener("click", function () {
          console.log("Submit button clicked");
          const email = document.getElementById("email").value;
          if (email) {
            // Show loading state
            const submitButton = document.getElementById("submit-referral");
            submitButton.textContent = "Progress...";
            submitButton.disabled = true;

            fetch("/apps/main", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({ referralCode, email }),
            })
              .then((res) => res.json())
              .then((data) => {
                console.log("Server Response:", data);
                submitButton.textContent = "Submit";
                submitButton.disabled = false;

                if (data.success) {
                  // Show discount code info
                  const discountInfoDiv =
                    document.getElementById("discount-info");
                  discountInfoDiv.style.display = "block";

                  // Format discount value for display
                  const discountDisplay =
                    data.discountType === "percentage"
                      ? `${data.discountValue}%`
                      : `$${data.discountValue}`;

                  // Clear the modal first
                  modal.innerHTML = `
                    <button id="close-popup" style="position: absolute; top: 5px; right: 5px; 
                      background: transparent; border: none; font-size: 20px; font-weight: bold;
                      cursor: pointer; color: black;">
                      &times;
                    </button>
                    <div style="margin-top: 15px; padding: 10px; background-color: #f8f8f8; border-radius: 5px;">
                      <h3 style="margin-top: 0; color: #4CAF50;">Referral Applied!</h3>
                      <p>Your discount code:</p>
                      <div style="background: #e9f7ef; padding: 8px; border-radius: 4px; margin: 10px 0; font-weight: bold; display: flex; justify-content: space-between; align-items: center; width: 90%; margin-left: auto; margin-right: auto;">
                        <span style="margin-right: 5px; overflow: hidden; text-overflow: ellipsis;">${data.discountCode}</span>
                        <button id="copy-code" style="background: transparent; border: none; cursor: pointer; font-size: 16px; flex-shrink: 0;">
                          📋
                        </button>
                      </div>
                      <p>Save ${discountDisplay} on your next purchase.</p>
                    </div>
                  `;

                  // Re-attach close button event listener
                  document
                    .getElementById("close-popup")
                    .addEventListener("click", function () {
                      console.log("Close button clicked");
                      document.getElementById("referral-popup").remove();
                    });

                  // Add copy button functionality
                  document
                    .getElementById("copy-code")
                    .addEventListener("click", function () {
                      navigator.clipboard.writeText(data.discountCode).then(
                        function () {
                          this.textContent = "✓";
                          setTimeout(() => {
                            this.textContent = "📋";
                          }, 2000);
                        }.bind(this),
                      );
                    });
                } else {
                  alert("Error: " + data.message);
                }
              })
              // This is only working
              .catch((error) => {
                console.error("Error Check:", error);
                submitButton.textContent = "Submit";
                submitButton.disabled = false;
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
