const axios = require('axios');
const fs = require('fs');
var vinculos = require('./vinculos');

const api = axios.create();

const url = 'https://transparencia.campos.rj.gov.br/api/v1/servants?search%5Byear%5D=2019&search%5Bterm%5D=&search%5BfilterBy%5D=&search%5BsortBy%5D=&search%5BsortDirection%5D=&search%5Bmonth%5D=12&page='

async function pegarFuncionariosPorPagina(pagina){
    return await api.get(url+pagina)
}

async function pegarTodosFuncionariosAtivos() {
    let funcionarios = [];

    let currentPage = 1;
    var response = await pegarFuncionariosPorPagina(currentPage);
    const totalPages = response.data.total_pages;
    var funcionariosPagina = response.data.records;

    for ( ; currentPage <= totalPages; currentPage++ ) {
        console.log(`Acessando url da página ${currentPage}...`)
        funcionariosPagina.forEach(f => {
            if ( f.link != 'INATIVOS' ) {
                let funcionario = {
                    matricula: f.enrollment_number,
                    nome: f.name,
                    vinculo: f.link
                }
                funcionarios.push(funcionario);
                console.log(`>>>O funcionário ${f.name} foi inserido com sucesso<<<`)
            }
        });

        await salvarArquivo(funcionarios, currentPage);

        response = await pegarFuncionariosPorPagina(currentPage);
        funcionariosPagina = response.data.records;
    }
    console.log(funcionarios);  

}

async function pegarTiposDeVinculos() {
    let currentPage = 1;

    var response = await pegarFuncionariosPorPagina(currentPage);
    const totalPages = response.data.total_pages;
    var funcionariosPagina = response.data.records;
    for( ; currentPage <= totalPages; currentPage++ ) {
        console.log(`Acessando url da página ${currentPage}...`)
        funcionariosPagina.forEach(f => {
            if ( vinculos.indexOf(f.link) === -1 ) {
                vinculos.push(f.link);
                console.log(`>>>O Vinculo ${f.link} foi inserido<<<`)
            }
        });
        
        await salvarArquivo(vinculos, currentPage);

        response = await pegarFuncionariosPorPagina(currentPage);
        funcionariosPagina = response.data.records;

    }
    console.log(vinculos)
}

async function sleep(ms) {
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
        end = new Date().getTime();
    }
}


async function salvarArquivo(array, pagina) {
    fs.writeFile('./arquivo', JSON.stringify(array), function(erro) {
        if(erro) {
            throw erro;
        }
        console.log(`Arquivo da página ${pagina} salvo corretamente...`);
    }); 
}
/*
**
columns:
      [ 'year',
        'month',
        'enrollment_number',
        'name',
        'role',
        'division',
        'link',
        'gross_salary',
        'discount',
        'net_salary' ],
**
*/



pegarTodosFuncionariosAtivos();
//pegarTiposDeVinculos();