import { Button } from "@shopify/polaris";
import { useEffect, useRef, useState } from "react";

const Modal: React.FC = () => {
  const modalRef = useRef<HTMLUIModalElement | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>("");

  useEffect(() => {
    if (!modalRef.current) return;
    modalRef.current.addEventListener("hide", () => console.log("Modal closed"));
  }, []);

  const openModal = () => {
    modalRef.current?.show();
  };

  const closeModal = () => {
    modalRef.current?.hide();
  };

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(event.target.value);
    console.log("Selected option:", event.target.value);
  };

  const handleSubmit = () => {
    console.log("Submitted option:", selectedOption);
    closeModal();
  };

  return (
    <div>
      <ui-modal id="my-modal" ref={modalRef}>
        <p>Message</p>
        <label>
          <input
            type="radio"
            name="userType"
            value="friend"
            checked={selectedOption === "friend"}
            onChange={handleRadioChange}
          />
          Friend
        </label>
        <label>
          <input
            type="radio"
            name="userType"
            value="referrer"
            checked={selectedOption === "referrer"}
            onChange={handleRadioChange}
          />
          Referrer
        </label>
        <ui-title-bar title="Title">
          <button variant="primary" onClick={handleSubmit}>Submit</button>
          <button onClick={closeModal}>Cancel</button>
        </ui-title-bar>
      </ui-modal>

      <Button variant="primary" onClick={openModal}>Open Modal</Button>
    </div>
  );
};

export default Modal;
