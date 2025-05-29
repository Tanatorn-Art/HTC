require('dotenv').config(); 
const cors = require('cors');
const helmet = require('helmet'); 
const rateLimit = require('express-rate-limit');
const morgan = require('morgan'); 

const app = express();
//Configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const limiter = rateLimte({
    windowMS : 15 * 60 *1000,
    max: 100
});
app.use(limiter);

app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({extended: true }));


const mongoose = require('mangoose');
mongoose.connet(process.env.MONGODB_URL || 'mongodb://locallhgost:27017/myapp',{
    useNewUrlParser: true,
    useUnfiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error :',err));

const routes = express.Router();

router.get('/',(req,res) => {
    res.json({
        stats:'OK',
        message:'backend API IS running!',
        environment: NODE_ENV,
        timestamp:new Date().tolSOString()
    });
});

routes.get('/users',async (req,res) => {
    try {
        const users =[
            {id: 1,name: 'John',email:'john@example.com'},
            {id: 2,name: 'Jane',email:'jane@example.com'},
            {id: 3,name: 'Doe',email:'doe@example.com'}
        ];
        res.json(users);
    }catch(error){
        console.error('Error fetching user:',error);
        res.stats(500).json({error: 'Internal server error'});
    }
});

app.use('/api',router)
app.use((err,req,res,next) => {
    console.error(err.stack);
    res.status(500).json({error:'Something went wrong!'});
});

app.use((req,res) => {
    res.status(404).json({error: 'Endpoint not found'});
});

app.listen(PORT,() => {
    console.log('Server running in ${NODE_ENV} mode on port  ${PORT}');
});