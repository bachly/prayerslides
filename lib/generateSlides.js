export default function generateSlides(group1, group2, group3) {
    let counter1 = 0,
        counter2 = 0,
        counter3 = 0,
        slides = [];

    let longestArray = group1;
    longestArray = (group2.length > longestArray.length) ? group2 : longestArray;
    longestArray = (group3.length > longestArray.length) ? group3 : longestArray;

    for (let i = 0; i < longestArray.length; i++) {
        slides.push({
            id: i + 1,
            image: `/img/${group1[counter1].names}.png`,
            location1: group1[counter1].location,
            nation1: group1[counter1].nation,
            name1: group1[counter1].names,
            surname1: group1[counter1].surname,
            location2: group2[counter2].location,
            nation2: group2[counter2].nation,
            name2: group2[counter2].names,
            surname2: group2[counter2].surname,
            location3: group3[counter3].location,
            nation3: group3[counter3].nation,
            name3: group3[counter3].names,
            surname3: group3[counter3].surname,
        })
        counter1 = (counter1 === group1.length - 1) ? 0 : counter1 + 1;
        counter2 = (counter2 === group2.length - 1) ? 0 : counter2 + 1;
        counter3 = (counter3 === group3.length - 1) ? 0 : counter3 + 1;
    }

    return slides
}