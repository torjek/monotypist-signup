document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signup-form');
    const emailInput = document.getElementById('email-input');
    const submitBtn = document.getElementById('submit-btn');
    const messageDiv = document.getElementById('form-message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        if (!email) return;

        // Visual loading state
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        messageDiv.className = 'message'; // reset

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                // Success
                form.reset();
                messageDiv.textContent = "Thank you! We'll be in touch.";
                messageDiv.className = 'message success show';
            } else {
                // Formspree returns an array of errors if it fails
                const data = await response.json();
                if (data.hasOwnProperty('errors')) {
                    messageDiv.textContent = data.errors.map(error => error.message).join(", ");
                } else {
                    messageDiv.textContent = "Oops! There was a problem submitting your form.";
                }
                messageDiv.className = 'message error show';
            }
        } catch (error) {
            messageDiv.textContent = "Oops! There was a problem submitting your form.";
            messageDiv.className = 'message error show';
        } finally {
            // Restore button
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });
});
