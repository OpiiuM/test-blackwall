(function () {
	const body = document.querySelector("body")
	const menu = document.querySelector(".header__nav")
	const burger = document.querySelector(".burger")

	if (burger) {
		burger.addEventListener("click", function () {
			body.classList.toggle("_lock")
			menu.classList.toggle("active")
			this.classList.toggle("burger--active")
		})
	}
})();