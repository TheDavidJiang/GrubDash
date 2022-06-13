const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function list(req, res){
    const { dishId } = req.params
    res.json({ data: dishes.filter(dishId ? dish => dish.id === dishId : () => true)})
}

function dishExists(req, res, next){
    const { dishId } = req.params
    const foundDish = dishes.find((dish)=> dish.id === dishId)
    if (foundDish){
        res.locals.dish = foundDish
        return next()
    }
    next({
        status: 404,
        message: `Dish id not found: ${dishId}`
    })
}

function idMatchBody(req, res, next){
    const dishId = req.params.dishId
    const { id } = req.body.data
    if (!id || id === dishId){
        return next()
    }
    next({
        status: 400,
        message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
    })
}

function hasProperty(propertyName){
    return function(req, res, next){
        const { data = {} } = req.body
        let property = data[propertyName]
        if (property && property.toString().length > 0 ){
            return next()
        }
        next(
        {
            status: 400,
            message: `Dish must include a ${propertyName}`
        })
    }
}


function pricePropertyIsValid(req, res, next){
    const { data: {price} = {} } = req.body
    if (Number(price) > 0 && Number.isInteger(price)){
        return next()
    }
    next({
        status: 400,
        message: "Dish must have a price that is an integer greater than 0"
    })

}

function create(req, res){
    const { data: { name, description, price, image_url} = {} } = req.body
    const newDish = {
        id: nextId(),
        name,
        description,
        price,
        image_url
    }
    dishes.push(newDish)
    res.status(201).json({ data: newDish })
}

function read(req, res){
    res.json({ data: res.locals.dish })
}

function update(req, res){
    const dish = res.locals.dish
    const {data : {name, description, price, image_url} = {} } = req.body

    dish.name = name
    dish.description = description
    dish.price = Number(price)
    dish.image_url = image_url

    res.json({ data: dish })
}
// function update(req, res){
//     const {id} = res.locals.dish

//     Object.assign(res.locals.dish, req.body.data, {id})
//     res.json({ data: res.locals.data })
// }


module.exports = {
    list,
    create: [
        hasProperty("name"),
        hasProperty("description"),
        hasProperty("price"),
        hasProperty("image_url"),
        pricePropertyIsValid,
        create],
    read: [dishExists, read],
    update: [dishExists, 
        idMatchBody,
        hasProperty("name"),
        hasProperty("description"),
        hasProperty("price"),
        hasProperty("image_url"),
        pricePropertyIsValid,
        update]
    
}