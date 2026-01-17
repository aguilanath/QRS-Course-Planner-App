from dimod import cqm_to_bqm
from dimod import SimulatedAnnealingSampler

sampler = SimulatedAnnealingSampler()


def solve(cqm):
    bqm, invert = cqm_to_bqm(cqm)

    QUBO = bqm

    response = sampler.sample(QUBO, num_reads=100)
    
    result = response.first.sample
    serializable_result = {str(k): int(v) for k, v in result.items()}
    return serializable_result