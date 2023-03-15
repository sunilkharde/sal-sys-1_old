import pool from '../db.js';

/*const unit_list = [
    { key: '1', value: 'Nos' },
    { key: '2', value: 'Kgs' },
    { key: '3', value: 'Bags' },
    { key: '4', value: 'Other' }
]
const category_list = [
    { key: '1', value: 'Category 1' },
    { key: '2', value: 'Category 2' },
    { key: '3', value: 'Category 3' },
    { key: '4', value: 'Category 4' }
]*/
/*const getData = async () => {
    const conn = await pool.getConnection();
    try {
        const [rows1] = await conn.query("SELECT unit_id,unit_name FROM units Where status='A'");
        const [rows2] = await conn.query("SELECT category_id,category_name FROM categories Where status='A'");
        return [rows1, rows2];
    } catch (error) {
        console.error(error);
        // Handle the error
    } finally {
        conn.release();
    }
}*/

class productController {
    static getData = async () => {
        const conn = await pool.getConnection();
        try {
            const [rows1] = await conn.query("SELECT unit_id,unit_name FROM units Where status='A'");
            const [rows2] = await conn.query("SELECT category_id,category_name FROM categories Where status='A'");
            return [rows1, rows2];
        } catch (error) {
            console.error(error);
            // Handle the error
        } finally {
            conn.release();
        }
    }

    static viewBlank = async (req, res) => {
        // Help for get data from list and array
        /*const data = [{ unit_list, category_list }]
        console.log(`Unit Values............ ${JSON.stringify(data[0].unit_list)}`)
        console.log(`Category Values............ ${JSON.stringify(data[0].category_list)}`)
        const units = data[0].unit_list;
        console.log(units);*/

        const [unit_list, category_list] = await this.getData();
        res.render('products/product-create', { unit_list, category_list });
    }

    static create = async (req, res) => {
        const { product_name, description, unit_id, category_id, rate, ext_code, status } = req.body;
        const data = req.body
        const [unit_list, category_list] = await this.getData();
        const conn = await pool.getConnection();

        var errors = [];
        // Validate input || product_name.trim().length === 0
        if (!product_name) {
            errors.push({ message: 'Product name is required' });
        }
        if (!unit_id) {
            errors.push({ message: 'Select product unit' });
        }
        if (!category_id) {
            errors.push({ message: 'Select product category' });
        }
        if (isNaN(rate) || rate <= 0) {
            errors.push({ message: 'Price must be a number' });
        }
        const [rows] = await conn.query('SELECT * FROM products WHERE product_name=?', [product_name]);
        if (rows.length > 0) {
            errors.push({ message: 'Product with this name is already exists' });
        }
        if (errors.length) {
            res.render('products/product-create', { errors, data, unit_list, category_list });
            return;
        }

        try {
            // Genrate max product id
            const [rows1] = await conn.query('SELECT Max(product_id) AS maxNumber FROM products');
            var nextProductID = rows1[0].maxNumber + 1;

            // Insert new record into database
            await conn.beginTransaction();
            var status_new = status !== null && status !== undefined ? status : 'A';
            var c_by = res.locals.user !== null && res.locals.user !== undefined ? res.locals.user.user_id : 0;
            const sqlStr = "INSERT INTO products (product_id,product_name,description,unit_id,category_id,rate,ext_code,status,c_at,c_by)" +
                " VALUES (?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP( ),?)"
            const params = [nextProductID, product_name, description, unit_id, category_id, rate, ext_code, status_new, c_by];
            const [result] = await conn.query(sqlStr, params);
            await conn.commit();

            //return res.render('products/product-view', { alert: `Save product successfully` });
            res.redirect('/product/view');
            //res.redirect('/');

        } catch (err) {
            await conn.rollback();
            conn.release();

            console.error(err);
            return res.render('products/product-view', { alert: `Internal server error` });
        } finally {
            conn.release();
        }
    };

    static viewAll = async (req, res) => {
        const conn = await pool.getConnection();
        // retrieve the alert message from the query parameters
        const alert = req.query.alert;
        try {
            const sqlStr = "Select a.product_id,a.product_name,a.description,b.unit_name,c.category_name " +
                " from products as a, units as b, categories as c " +
                " Where a.unit_id=b.unit_id and a.category_id=c.category_id";
            const [results] = await conn.query(sqlStr)//, params);
            res.render('products/product-view', { products: results, alert });

        } catch (error) {
            console.error(error);
            // Handle the error
        } finally {
            conn.release();
        }
    }

    static edit = async (req, res) => {
        const { id } = req.params;
        const conn = await pool.getConnection();
        try {
            const [unit_list, category_list] = await this.getData();
            const sqlStr = "Select * from products Where product_id= ?";
            const params = [id];
            const [results] = await conn.query(sqlStr, params);
            res.render('products/product-edit', { data: results[0], unit_list, category_list });
        } catch (error) {
            console.error(error);
            // Handle the error
        } finally {
            conn.release();
        }
    }

    static update = async (req, res) => {
        const { id } = req.params;
        const { product_name, description, unit_id, category_id, rate, ext_code, status } = req.body;
        const data = req.body
        const [unit_list, category_list] = await this.getData();
        const conn = await pool.getConnection();

        var errors = [];
        // Validate input || product_name.trim().length === 0
        if (!product_name) {
            errors.push({ message: 'Product name is required' });
        }
        if (!unit_id) {
            errors.push({ message: 'Select product unit' });
        }
        if (!category_id) {
            errors.push({ message: 'Select product category' });
        }
        if (isNaN(rate) || rate <= 0) {
            errors.push({ message: 'Price must be a number' });
        }
        const [rows] = await conn.query('SELECT * FROM products WHERE product_name=? and product_id<>?', [product_name, id]);
        if (rows.length > 0) {
            errors.push({ message: 'Product with this name is already exists' });
        }
        if (errors.length) {
            res.render('products/product-edit', { errors, data, unit_list, category_list });
            return;
        }

        try {
            // Update record into database using product_id
            await conn.beginTransaction();
            var status_new = status !== null && status !== undefined ? status : 'A';
            var u_by = res.locals.user !== null && res.locals.user !== undefined ? res.locals.user.user_id : 0;
            const sqlStr = "UPDATE products Set product_name=?,description=?,unit_id=?,category_id=?,rate=?,ext_code=?,status=?,u_at=CURRENT_TIMESTAMP,u_by=?" +
                " WHERE product_id=?"
            const params = [product_name, description, unit_id, category_id, rate, ext_code, status_new, u_by, id];
            const [result] = await conn.query(sqlStr, params);
            await conn.commit();

            //res.redirect('/product/view');
            res.redirect('/product/view?alert=Update+product+successfully');

        } catch (err) {
            await conn.rollback();
            conn.release();

            console.error(err);
            return res.render('products/product-view', { alert: `Internal server error` });
        } finally {
            conn.release();
        }
    };

    static delete = async (req, res) => {
        const { id } = req.params;
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();
            const sqlStr = "Delete from products WHERE product_id=?"
            const params = [id];
            const [result] = await conn.query(sqlStr, params);
            await conn.commit();
            //
            //res.redirect('/product/view');
            res.redirect('/product/view?alert=Product+deleted+successfully');
        } catch (err) {
            await conn.rollback();
            conn.release();
            console.error(err);
            return res.render('products/product-view', { alert: `Internal server error` });
        } finally {
            conn.release();
        }
    };

};

export default productController