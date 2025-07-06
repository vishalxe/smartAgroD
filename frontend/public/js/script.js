$(document).ready(function(){
    $(".filter-item").click(function () {
        const value = $(this).attr("data-filter");
        if(value=="all"){
            $(".post-box").show("1000");
        }else{
            $(".post-box")
            .not("."+value)
            .hide("1000");
            $(".post-box")
            .filter("."+value)
            .show("1000");
        }
        
    });

    $(".filter-item").click(function () {
        $(this).addClass("active-filter").siblings().removeClass("active-filter");

    });


});


let header = document.querySelector("header");

window.addEventListener("scroll",()=>{
    header.classList.toggle("shadow",window.scrollY>0);
});


const blogs = [
    {
        title: "Blog 1",
        image: "images/blog-1.jpg",
        heading: "Get Growing: DIY Gardening Projects for Home Vegetable Gardens",
        content: "Transforming your backyard into a thriving vegetable garden doesn't have to be daunting or expensive. With a little creativity and DIY spirit, you can create a productive and beautiful garden space that yields fresh produce year-round. In this guide, we'll explore a variety of DIY gardening projects that are perfect for home vegetable gardens, from raised beds and trellises to compost bins and herb spirals."
    },
    {
        title: "Blog 2",
        image: "images/blog-2.jpg",
        heading: "LET US BEGIN GARDENING",
        content: "Welcome to our comprehensive guide to seasonal planting, where we delve into the art of cultivating a flourishing garden using organic practices. Whether you're a seasoned gardener or a novice with a green thumb, this guide will provide you with invaluable insights and tips for nurturing your garden throughout the year."
    },
    {
        title: "Blog 3",
        image: "images/blog-3.jpg",
        heading: "Ingredient Spotlight: Celebrating the Flavors and Benefits of Seasonal Vegetables",
        content: "Seasonal vegetables not only bring vibrant colors and flavors to our plates but also offer a myriad of health benefits. By embracing the bounty of each season, we can enjoy fresh, nutritious produce while supporting local farmers and reducing our environmental footprint. In this ingredient spotlight, we'll explore the flavors, benefits, and culinary possibilities of seasonal vegetables, inspiring you to savor the best that nature has to offer throughout the year."
        
    },
    {
        title: "Blog 4",
        image: "images/blog-4.png",
        heading: "hydtd",
        content: "hjidg"
    },
    {
        title: "Blog 5",
        image: "images/blog-5.jpg",
        heading: "hydtd",
        content: "hjidg"
    },
    {
        title: "Blog 6",
        image: "images/blog-6.jpg",
        heading: "hydtd",
        content: "hjidg"
    },
    {
        title: "Blog 7",
        image: "images/blog.jpg",
        heading: "hydtd",
        content: "hjidg"
    },
    {
        title: "Blog 8",
        image: "images/blog.jpg",
        heading: "hydtd",
        content: "hjidg"
    },
    {
        title: "Blog 9",
        image: "images/blog.jpg",
        heading: "hydtd",
        content: "hjidg"
    }
    // Add more blog data as needed
];

function loadBlog(clickedElement, blogTitle) {
    // Find the selected blog from the blogs array
    const selectedBlog = blogs.find(blog => blog.title === blogTitle);

    if (selectedBlog) {
        localStorage.setItem('selectedBlog', JSON.stringify(selectedBlog));
        window.location.href = 'postpage.html';
    }
}

const selectedBlog = JSON.parse(localStorage.getItem('selectedBlog'));

// Update content with selected blog data
document.getElementById('blog-title').innerText = selectedBlog.title;
document.getElementById('blog-image').src = selectedBlog.image;
document.getElementById('sub-title').innerText = selectedBlog.heading; // Corrected from heading to title
document.getElementById('blog-text').innerText = selectedBlog.content;
