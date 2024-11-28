function toggleSettings(id) {
    const options = ["general", "notifications", "appearance", "accounts"];
    const div = document.getElementById(id);

    options.forEach(option => {
        const newDiv = document.getElementById(option);
        newDiv.style.display = (option === id) ? "block" : "none";
    });
}
