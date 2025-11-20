function fetchCatUrls(n){
  return Array.from({length:n}).map((_,i)=>`https://cataas.com/cat?width=800&height=1000&t=${Date.now()}-${i}`);
}
