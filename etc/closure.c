var bar(i64 len, i64 *ctx) {
	return ctx[2]++;
}
var foo0(i64 len, i64 *ctx, a1, a2) {
	argv[0] = a1;
	argv[1] = a2;
	argv[2] + argv[0] + argv[1];
	return fun_to_any(&bar, argv);
}
var foo1(i64 len, i64 *ctx, a1, a2) {
void* call = any_to_fun(foo0(2, 1, 3, env(3)));
call[0](0, call[1]);
}

