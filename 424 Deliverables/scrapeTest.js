document.addEventListener('scroll', (e) => {
  let navItems = document.getElementsByClassName("nav")[0].getElementsByTagName("li");

  for (var idx in navItems) {
    let tmp = navItems[idx].getBoundingClientRect();

    let centerX = tmp.left + tmp.width / 2;
    let centerY = tmp.top + tmp.height / 2;

    console.log(`Item ${idx}: (${centerX}, ${centerY})`);
  }
})