#!/usr/bin/env node

'use strict'

const Koa = require('koa')
const Router = require('koa-router')
const stat = require('koa-static')
// const Database = require('sqlite-async')
const handlebars = require('koa-hbs-renderer')
const bodyParser = require('koa-bodyparser')

const sqlite3 = require('sqlite3')
const { open } = require('sqlite')

const app = new Koa()
const router = new Router()
app.use(stat('public'))
app.use(bodyParser())
app.use(handlebars({ paths: { views: `${__dirname}/views` } }))
app.use(router.routes())
app.use(bodyParser())

const port = 8080
const dbName = 'bookshop.db'
let db

// Connect to Sqlite DB
open({
	filename: './bookshop.db',
	driver: sqlite3.Database
}).then((DB) => {
	db = DB
	console.log('Database connection is ready')
}).catch((err) => {
	console.log(err.message)
})

router.get('/', async ctx => {
	try {
		console.log('/')
		const sql = 'SELECT id, title FROM books;'
		const data = await db.all(sql)
		console.log(data)
		await ctx.render('home', {title: 'Favourite Books', books: data})
	} catch(err) {
		ctx.body = err.message
	}
})

/* router.get('/', async ctx => {
	try {
		let sql = 'SELECT id, title FROM books;'
		let querystring = ''
		console.log(ctx.query.q)
		if(ctx.query !== undefined && ctx.query.q !== undefined) {
			sql = `SELECT id, title FROM books 
							WHERE upper(title) LIKE "%${ctx.query.q}%" 
							OR upper(description) LIKE upper("%${ctx.query.q}%");`
			querystring = ctx.query.q
		}
		const db = await Database.open(dbName)
		const data = await db.all(sql)
		await db.close()
		console.log(data)
		await ctx.render('newindex', {books: data, query: querystring})
	} catch(err) {
		ctx.body = err.message
	}
}) */

router.get('/details/:id', async ctx => {
	try {
		console.log(ctx.params.id)
		const sql = `SELECT * FROM books WHERE id = ${ctx.params.id};`
		const data = await db.get(sql)
		console.log(data)
		await ctx.render('details', data)
	} catch(err) {
		ctx.body = err.message
	}
})

// router.get('/form', async ctx => await ctx.render('form'))

router.post('/add', async ctx => {
	try {
		console.log(ctx.request.body)
		const body = ctx.request.body
		const sql = `INSERT INTO books(title, isbn, description) 
			VALUES("${body.title}", "${body.isbn}", "${body.description}");`
		console.log(sql)
		await db.exec(sql)
		ctx.redirect('/')
	} catch(err) {
		ctx.body = err.message
	}
})

module.exports = app.listen(port, () => console.log(`listening on port ${port}`))
