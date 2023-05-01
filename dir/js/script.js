//Method for the search bar to search for games
const searchInput = document.getElementById('search');
searchInput.addEventListener('input', function () {
    const query = this.value.toLowerCase();
    const boxes = document.querySelectorAll('.box');
    boxes.forEach(function (box) {
        const title = box.querySelector('h2').textContent.toLowerCase();
        if (title.indexOf(query) === -1) {
            box.style.display = 'none';
        } else {
            box.style.display = 'block';
        }
    });
});