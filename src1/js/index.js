import Search from './models/Search';
import Recipe from'./models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements,renderLoader,clearLoader } from './views/base';

/**global state of the app
 * -search object
 * current recipe object
 * shopping list object
 * liked recipe
 */
const state={};
/**search controller
 * 
 */
window.state=state;
const controlSearch=async()=>{
    //1)get query from view
    const query = searchView.getInput();
    //const query='pizza';
    //console.log(query);
    if(query){
        //2 new search object and add to the state variable
        state.search=new Search(query);
        //3 prepare ui for results 
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);
        try{

        //4 search for recipes 
        await state.search.getResults();

        //5 render results on ui
        clearLoader();
        searchView.renderResults(state.search.result);
        } catch (error){
            alert('something wrong with the search...');
            clearLoader();
        }
    }

}
    elements.searchForm.addEventListener('submit',e=>{
        e.preventDefault();
        controlSearch();
    });
//testing
    //window.addEventListener('load',e=>{
      //  e.preventDefault();
        //controlSearch();
    //});



    elements.searchResPages.addEventListener('click',e=>{
        const btn=e.target.closest('.btn-inline');
        if (btn){
            const goToPage=parseInt(btn.dataset.goto,10);
            searchView.clearResults();
            searchView.renderResults(state.search.result,goToPage);
        //console.log(goToPage);
        }
    });
//const search=new Search('pizza');
//console.log(search);
//search.getResults();
/**recipe controller
 * 
 *
*/
//const r=new Recipe(47746);
//r.getRecipe();
//console.log(r);
const controlRecipe = async()=>{
//get id from url
    const id=window.location.hash.replace('#','');
    console.log(id);
    
    if(id)
    {
//prepare ui for changes
recipeView.clearRecipe();
renderLoader(elements.recipe);
//highlight the selected search item
if(state.search)
searchView.highlightSelected(id);
//create new recipe object
state.recipe=new Recipe(id);
//testing
//window.r=state.recipe;


try{
//get recipe data and parse ingredients
await state.recipe.getRecipe();
//console.log(state.recipe.ingredients);
state.recipe.parseIngredients();
//calculate servings and time
state.recipe.calcTime();
state.recipe.calcServings();
//render recipe 
clearLoader();
recipeView.renderRecipe(
    state.recipe,
    state.likes.isLiked(id)
    );
//console.log(state.recipe);
    }catch(err){
        console.log(err);
        alert('error processing recipe');
    }
}
};
//window.addEventListener('hashchange',controlRecipe);
//window.addEventListener('load',controlRecipe);
['hashchange','load'].forEach(event=>window.addEventListener(event,controlRecipe));

/**
 * list controller

 */
const controlList=()=>{
    //create a new list if there is not yet
    if(!state.list) state.list=new List();
    //add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el=>{
const item=state.list.addItem(el.count,el.unit,el.ingredient);
listView.renderItem(item);
    });
}
//handle delete and update list item events
elements.shopping.addEventListener('click',e=>{
const id=e.target.closest('.shopping__item').dataset.itemid;

//hndle the delete button
if(e.target.matches('.shopping__delete, .shopping__delete *')){
    //delete from state
state.list.deleteItem(id);

    //delete from ui

    listView.deleteItem(id);
    //handle the count update
}else if(e.target.matches('.shopping__count-value')){
const val=parseFloat(e.target.value,10);
state.list.updateCount(id,val);

}

});
/**
 * like controller
*/
state.likes = new Likes();
likesView.toggleLikeMenu(state.likes.getNumLikes());
const controlLike = () => {
    if(!state.likes) state.likes=new Likes();
    const currentID=state.recipe.id;
    //user has not yet liked current recipe
    if(!state.likes.isLiked(currentID)){
//add like to the state
const newLike=state.likes.addLike(
    currentID,
    state.recipe.title,
    state.recipe.author,
    state.recipe.img
    );
//toggle the like button
likesView.toggleLikeBtn(true);
//add like to the ui list
likesView.renderLike(newLike);
//console.log(state.likes);

   //user has  liked current recipe
    }
    else{
        //remove like from the state
        state.likes.deleteLike(currentID);

//toggle the like button

likesView.toggleLikeBtn(false);

//remove like from the ui list
console.log(state.likes);
likesView.deleteLike(currentID);

    }
likesView.toggleLikeMenu(state.likes.getNumLikes());
};
//restore liked recipes on page load
window.addEventListener('load',() => {
    state.likes = new Likes();

    //restore likes
    state.likes.readStorage();
    //toggle like menu button
likesView.toggleLikeMenu(state.likes.getNumLikes());
//render the existing likes
state.likes.likes.forEach(like=>likesView.renderLike(like)

);

});

//handling recipe button clicks
elements.recipe.addEventListener('click',e=>{
if(e.target.matches('.btn-decrease, .btn-decrease *'))//target button decrease or any child of button decrease
{
    //decrease button is clicked
    if(state.recipe.servings>1){
    state.recipe.updateServings('dec');
    recipeView.updateServingsIngredients(state.recipe);
}
}
else if(e.target.matches('.btn-increase, .btn-increse *'))//target button decrease or any child of button decrease
{
    //increase button is clicked
    state.recipe.updateServings('inc');
    recipeView.updateServingsIngredients(state.recipe);
}else if (e.target.matches('.recipe__btn--add,.recipe__btn--add *')){
    //add ingredient to shopping list
    controlList();
}else if(e.target.matches('.recipe__love,.recipe__love *')){
    //like controller
    controlLike();
}
//console.log(state.recipe);

});
//const l=new List();
window.l=new List();






