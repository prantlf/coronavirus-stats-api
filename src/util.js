export async function loop (middlewares, request, response) {
  let output
  for (const middleware of middlewares) {
    const promise = new Promise(resolve => middleware(request, response, resolve))
    output = await promise || output
  }
  return output
}
