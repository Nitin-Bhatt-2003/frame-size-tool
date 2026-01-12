document.addEventListener('DOMContentLoaded', () => {
    // Inputs
    const pdInput = document.getElementById('pd');
    const noseInput = document.getElementById('nose');
    const faceInput = document.getElementById('face');
    // Using querySelectorAll for radio buttons to get the checked one later
    const usageInputs = document.querySelectorAll('input[name="usage"]');

    // Display Values
    const pdValDisplay = document.getElementById('pd-val');
    const noseValDisplay = document.getElementById('nose-val');
    const faceValDisplay = document.getElementById('face-val');

    // Button
    const recommendBtn = document.getElementById('recommend-btn');

    // Output Areas
    const resultsPanel = document.getElementById('results-panel');
    const emptyState = resultsPanel.querySelector('.empty-state');
    const resultsContent = resultsPanel.querySelector('.results-content');

    // Result Fields
    const resFrameSize = document.getElementById('res-frame-size');
    const resLensWidth = document.getElementById('res-lens-width');
    const resBridge = document.getElementById('res-bridge');
    const resTemple = document.getElementById('res-temple');
    const resFrameType = document.getElementById('res-frame-type');
    const resAdvisoryCard = document.getElementById('res-advisory-card');
    const resAdvisory = document.getElementById('res-advisory');

    // Dynamic Diagram IDs
    const dynLens = document.getElementById('dyn-lens');
    const dynBridge = document.getElementById('dyn-bridge');
    const dynTemple = document.getElementById('dyn-temple');

    // Update displays on slide
    function updateDisplays() {
        pdValDisplay.textContent = `${parseFloat(pdInput.value).toFixed(1)} mm`;
        noseValDisplay.textContent = `${parseFloat(noseInput.value).toFixed(1)} mm`;
        faceValDisplay.textContent = `${parseFloat(faceInput.value).toFixed(1)} mm`;
    }

    pdInput.addEventListener('input', updateDisplays);
    noseInput.addEventListener('input', updateDisplays);
    faceInput.addEventListener('input', updateDisplays);

    // Initial update
    updateDisplays();

    // Recommendation Logic
    function recommendFrame(pd, noseWidth, totalFaceWidth, usage) {
        let lensWidth = "";
        let frameSize = "";
        let bridge = "";
        let temple = "";
        let frameType = "";
        let advisory = "";

        // --- Lens width based on PD ---
        if (pd <= 60) {
            lensWidth = "48–50 mm";
            frameSize = "Small";
        } else if (pd <= 64) {
            lensWidth = "51–53 mm";
            frameSize = "Medium";
        } else if (pd <= 68) {
            lensWidth = "54–56 mm";
            frameSize = "Large";
        } else {
            lensWidth = "57–59 mm";
            frameSize = "Extra Large";
        }

        // --- Bridge width ---
        if (noseWidth <= 16) {
            bridge = "16–17 mm";
        } else if (noseWidth <= 18) {
            bridge = "18–19 mm";
        } else {
            bridge = "20–22 mm";
        }

        // --- Temple length ---
        if (totalFaceWidth < 125) {
            temple = "135 mm";
        } else if (totalFaceWidth <= 140) {
            temple = "140 mm";
        } else {
            temple = "145–150 mm";
        }

        // --- Frame Type Logic ---
        if (usage === "Progressive" || usage === "Computer") {
            frameType = "Rectangular or Square";
        } else { // Single Vision
            if (totalFaceWidth < 125) {
                frameType = "Oval or Round";
            } else if (totalFaceWidth <= 140) {
                frameType = "Rectangular, Oval, or Wayfarer";
            } else {
                frameType = "Rectangular, Square, or Wayfarer";
            }
        }

        // --- Usage-specific advisory ---
        if (usage === "Progressive") {
            advisory = "Ensure frame height ≥ 30 mm. Avoid narrow or shallow frames.";
        } else if (usage === "Computer") {
            advisory = "Prefer wider lenses and stable temples.";
        }

        return {
            frameSize,
            lensWidth,
            bridge,
            temple,
            frameType,
            advisory
        };
    }

    // Handle Calculation
    recommendBtn.addEventListener('click', () => {
        // Get values
        const pd = parseFloat(pdInput.value);
        const nose = parseFloat(noseInput.value);
        const face = parseFloat(faceInput.value);
        let usage = "Single Vision";

        usageInputs.forEach(radio => {
            if (radio.checked) {
                usage = radio.value;
            }
        });

        // Calculate
        const result = recommendFrame(pd, nose, face, usage);

        // Update UI
        resFrameSize.textContent = result.frameSize;
        resLensWidth.textContent = result.lensWidth;
        resBridge.textContent = result.bridge;
        resTemple.textContent = result.temple;
        resFrameType.textContent = result.frameType;

        if (result.advisory) {
            resAdvisory.textContent = result.advisory;
            resAdvisoryCard.classList.remove('hidden');
        } else {
            resAdvisoryCard.classList.add('hidden');
        }

        // Update Dynamic Diagram
        // Extract single numbers from ranges for cleaner display (e.g. "51-53 mm" -> "52")
        dynLens.textContent = result.lensWidth.replace(' mm', '').split('–')[0];
        dynBridge.textContent = result.bridge.replace(' mm', '').split('–')[0];
        dynTemple.textContent = result.temple.replace(' mm', '').split('–')[0];

        // Show results
        emptyState.style.display = 'none';
        resultsContent.classList.remove('hidden');

        // Optional: specific animation
        resultsContent.style.animation = 'none';
        resultsContent.offsetHeight; /* trigger reflow */
        resultsContent.style.animation = 'fadeIn 0.5s ease-out';

        // --- Counter API: Increment ---
        fetch('https://api.counterapi.dev/v1/lenskart-frame-tool/recommendations/up')
            .then(res => res.json())
            .then(data => {
                const countDisplay = document.getElementById('recommendation-count');
                if (countDisplay && data.count) {
                    countDisplay.textContent = data.count;
                }
            })
            .catch(err => console.log('Counter increment failed', err));
    });

    // --- Counter API: Load Count on Start ---
    const countDisplay = document.getElementById('recommendation-count');
    if (countDisplay) {
        fetch('https://api.counterapi.dev/v1/lenskart-frame-tool/recommendations/')
            .then(res => res.json())
            .then(data => {
                if (data.count) {
                    countDisplay.textContent = data.count;
                }
            })
            .catch(err => {
                console.log('Counter load failed', err);
                countDisplay.textContent = '...';
            });
    }
});
