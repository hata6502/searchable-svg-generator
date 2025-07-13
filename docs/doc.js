const fileInput = document.querySelector("#file-input");
const ocrForm = document.querySelector("#ocr-form");
const result = document.querySelector("#result");
const submitButton = document.querySelector("#submit-button");

ocrForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  submitButton.disabled = true;
  submitButton.textContent = "Generating...";
  try {
    const file = fileInput.files[0];
    if (!file) {
      alert("No file selected.");
      return;
    }

    const dataURL = await new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        resolve(event.target.result);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
      fileReader.readAsDataURL(file);
    });

    const href = URL.createObjectURL(file);

    const image = new Image();
    image.src = href;
    await image.decode();

    const response = await fetch(
      "https://ocr-162013450789.us-central1.run.app",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          href,
          alt: "(alt text here)",
          image: dataURL.split(",")[1],
          width: image.naturalWidth,
          height: image.naturalHeight,
        }),
      }
    );
    if (!response.ok) {
      alert("Error uploading file.");
      return;
    }
    const { html } = await response.json();

    result.replaceChildren();

    const resultHTML = document.createElement("pre");
    resultHTML.textContent = html;
    result.append(resultHTML);

    result.insertAdjacentHTML("beforeend", html);
    const svg = result.querySelector("svg");
    svg.classList.add("mt-4");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Generate";
  }
});
