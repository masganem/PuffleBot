require('dotenv').config();
import {app} from './app';


app.listen(process.env.PORT || 8000, () => console.log('Server running...'));
