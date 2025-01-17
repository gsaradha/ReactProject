import React,{Component} from 'react';
import Aux from '../../hoc/Aux/aux';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import axios from '../../axios-orders';
import Spinner from '../../components/UI/spinner/spinner';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';

const INGREDIENT_PRICES ={
    salad:0.5,
    cheese:0.4,
    meat:1.3,
    bacon:0.7
}
class BurgerBuilder extends Component{
    state={
        ingredients:null,
        totalPrice : 4,
        purchasable:false,
        purchasing:false,
        loading:false,
        error:false
    }

    componentDidMount(){
        axios.get('https://burgerbuilder-58abe-default-rtdb.firebaseio.com/ingredients.json')
        .then (res=>{
            this.setState({ingredients:res.data})
        })
        .catch(err=>{this.setState({error:true})});
    }

    purchaseHandler=()=>{
        this.setState({
            purchasing : true
        })
    }

    updatePurchaseState(newIngredients){
        const ingredients= newIngredients;

        const sum=Object.keys(ingredients)
        .map(igKey=>{
            return ingredients[igKey]
        })
        .reduce((sum,el)=>(sum + el),0);

        this.setState({
            purchasable: sum>0
        });
    }
    addIngredientHandler =(type) =>{
        const oldCount = this.state.ingredients[type];
        const updatedCount= oldCount +1;
        const updatedIngredients = {
            ... this.state.ingredients
        }
        updatedIngredients[type] = updatedCount;
        const priceAddition = INGREDIENT_PRICES[type];
        const oldPrice = this.state.totalPrice;
        const newPrice = oldPrice + priceAddition;
        this.setState({totalPrice:newPrice,ingredients:updatedIngredients});
        this.updatePurchaseState(updatedIngredients);
    }

    purchaseCancelHandler =() =>{
        this.setState({purchasing:false})
    }

    removeIngredientHandler =(type) =>{
        const oldCount = this.state.ingredients[type];
        if(oldCount <=0){
            return;
        }
        const updatedCount= oldCount -1;
        const updatedIngredients = {
            ... this.state.ingredients
        }
        updatedIngredients[type] = updatedCount;
        const priceAddition = INGREDIENT_PRICES[type];
        const oldPrice = this.state.totalPrice;
        const newPrice = oldPrice - priceAddition;
        this.setState({totalPrice:newPrice,ingredients:updatedIngredients});
        this.updatePurchaseState(updatedIngredients);

    }

    purchaseContinueHandler=()=>{
        //alert('You continue');
        this.setState({loading:true})
        const order={
            ingredients:this.state.ingredients,
            price:this.state.totalPrice,
            customer:{
                name:'saradha',
                address:{
                    street:'Test',
                    zipCode:'123456',
                    country:'USA'
                },
                email:'test@test.com'
            },
            deliveryMethod:'fastest'
        }
        axios.post('/orders.json',order)
        .then(res=>{
            this.setState({
                loading:false,
                purchasing:false
            })
        })
        .catch(err=> this.setState({
            loading:false,
            purchasing:false
        }))
    }
    render(){
        const disabledInfo = {
            ...this.state.ingredients
        }
        for(let key in disabledInfo){
            disabledInfo[key] = disabledInfo[key] <=0 
        }
        let orderSummary=null;
        let burger = this.state.error?<p style={{textAlign:'center'}}>Ingredients cant be loaded</p>:<Spinner/>;
        if(this.state.ingredients){
            orderSummary=<OrderSummary 
            ingredients = {this.state.ingredients}
            purchaseCancelled ={this.purchaseCancelHandler}
            purchaseContinued = {this.purchaseContinueHandler}
            price={this.state.totalPrice.toFixed(2)}/>;
            if(this.state.loading){
                orderSummary = <Spinner />;
            }
            burger= (
                    <Aux>
                <Burger ingredients = {this.state.ingredients}/>
                <BuildControls 
                ingredientAdded = {this.addIngredientHandler}  
                ingredientRemoved={this.removeIngredientHandler}
                disabled ={disabledInfo} 
                purchasable = {this.state.purchasable}
                price ={this.state.totalPrice}
                ordered = {this.purchaseHandler}/>
                </Aux>)
        }

        return(
         <Aux>
             <Modal show={this.state.purchasing} modalClosed={this.purchaseCancelHandler}>
                {orderSummary}
             </Modal>
             {burger}
            
         </Aux>
        );
    }
}


export default withErrorHandler(BurgerBuilder,axios);