import * as _ from 'lodash'
import {
  __generateId,
  __generateDate
} from 'utils'

// @TODO this files we'll redo soon. link: https://github.com/GroceriStar/sd/issues/76
// we don't need them at this moment, but later - it'll be part of our graphql-server functionality
import {
  ultimateGroceryList,
  groceryListWithUserRelations,
  dbIngredients,

  ingredients,
  departments,
  groceries
} from '@files'



// @TODO can we update our methods - but we'll need to go step by step,
// because these methods used in our react projects.
// so I propose do it very carefully
const getUltimateGrocery = () => {
  return ultimateGroceryList
}

const getGLwithUserRelations = () => {
  return groceryListWithUserRelations
}

const getIngredientsSampleFromDB = () => {
  return dbIngredients
}

const getIngredients = () => {
  return ingredients
}

const getDepartments = () => {
  return departments
}

const getGroceryById = ( id ) => {

  return [ _.find(groceries, ['id', id]) ];
};
//
const getGroceryByName = (name) => {

  return _.filter(groceries, function(item) {
    return item.name === name;
  })
}

const getCountIngOfDepartment = () => {
  let result = _.map(departments, function(department){
      let ingredientsByOneDepartment =
        getAllIngredientsByOneDepartment(department.name);
    return {
      ...department,
      countIngredients: ingredientsByOneDepartment.length
    }
  })

  return result;
}

const getAllDepartmentList = () => {
  return _.map(departments, item => ({
    key: uuidv1(),
    departmentName: item
  }));
};

const getAllIngredientsWithId = () => {
  let ingredients = getIngredients();

  let result = _.map(ingredients, function(ingredient){
    return {
      key: uuidv1(),
      ...ingredient
    }
  })

  return result;
}

const getUserObject =  (name) => {
  var userObj = {
    'name': name,
    'img': 'false',
    'desc': 'false',
    'slug': 'false',
    'created_at': __generateDate(),
    'updated_at': __generateDate(),
    'id': __generateId(),
    'hideThisIds': [],
    'purchasedIds': [],
    'ingredientIds': []
  }
  const hideIdsCount = Math.floor(Math.random() * 5)
  const purchasedIdsCount = Math.floor(Math.random() * 10)
  const ingredientIdsCount = Math.floor(Math.random() * 50)

  for (let i = 0; i < 50; i++) {
    if (i < hideIdsCount) {
      userObj.hideThisIds[i] = __generateId()
    }
    if (i < purchasedIdsCount) {
      userObj.purchasedIds[i] = __generateId()
    }
    if (i < ingredientIdsCount) {
      userObj.ingredientIds[i] = __generateId()
    }
  }
  return userObj
  // return []
}

export {
  getUltimateGrocery,
  getGLwithUserRelations,

  getUserObject,
  getIngredientsSampleFromDB

}